import { TeaState } from '@/engine/TeaState';
import { PhysicsEngine } from '@/engine/PhysicsEngine';
import { PersistenceManager } from '@/engine/PersistenceManager';
import { BrewingRegion, TeaType, UnitSystem } from '@/domain/enums';
import { REGION_PRESETS } from '@/data/presets';
import { SimulationSnapshotBuilder } from '@/domain/models/SimulationSnapshotBuilder';
import type { SimulationSnapshot } from '@/domain/types';

// Facade Pattern: single entry point hiding all subsystem complexity
export class BrewFacade {
  private readonly engine = new PhysicsEngine();
  private state = TeaState.createDefault();
  private running = false;
  private rafId = 0;
  private onTickCallback: ((snapshot: SimulationSnapshot) => void) | null = null;
  private onCompleteCallback: (() => void) | null = null;
  private onExhaustedCallback: (() => void) | null = null;

  // ---- Configuration ----
  applyRegionPreset(region: BrewingRegion, teaType: TeaType): void {
    const preset = REGION_PRESETS[region];
    this.state.teaType = teaType;
    this.state.vessel = preset.defaultVessel;
    this.state.currentTemp = preset.defaultTemp;
    this.state.leafMass = preset.defaultLeafMass;
    this.state.waterVolumeMl = preset.defaultWaterVolume;
    this.state.numInfusions = preset.defaultNumInfusions;
    this.state.tds = preset.defaultTds;
    this.state.altitudeM = preset.defaultAltitude;
    this.state.leafWidth = preset.defaultLeafWidth;
    this.state.leafHeight = preset.defaultLeafHeight;
    this.state.boilMethod = preset.defaultBoilMethod;
    this.state.unitSystem = UnitSystem.Metric;
    this.state.useFahrenheit = false;
    this.state.leafDensity = 0; // will be filled from profile
    this.state.hasButter = region === BrewingRegion.Tibetan && teaType === TeaType.Tibetan;
    this.state.boilingInPot = region === BrewingRegion.Tibetan;
    this.state.heatLevel = region === BrewingRegion.Tibetan ? 5 : 0;
  }

  applyExpertConfig(config: Partial<TeaState>): void {
    Object.assign(this.state, config);
  }

  getState(): TeaState {
    return this.state;
  }

  cloneState(): TeaState {
    return this.state.clone();
  }

  // ---- Lifecycle ----
  startSession(): void {
    if (this.running) {
      // Resume: just catch up lastUpdateTime to avoid huge dt jump
      this.state.lastUpdateTime = performance.now();
      return;
    }
    const saved = PersistenceManager.load();
    if (saved) {
      this.state.currentTemp = saved.currentTemp;
      this.state.tempPreserved = true;
    }
    this.state.startTime = performance.now();
    this.state.lastUpdateTime = this.state.startTime;
    this.state.cycleStartTime = this.state.startTime;
    this.state.currentInfusion = 0;
    this.state.cycleActive = false;
    this.state.extractionLevel = 0;
    this.state.isExhausted = false;
    this.state.stopSignal = false;
    this.running = true;
    this.tick();
  }

  stopSession(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    PersistenceManager.save(this.state);
  }

  nextInfusion(temp: number, volume: number): void {
    this.state.accumulate();
    this.state.currentInfusion++;
    this.state.currentTemp = temp;
    this.state.waterVolumeMl = volume;
    this.state.resetCycle();
    const baseSlice = 100.0 / (this.state.numInfusions || 1);
    const adjusted = this.engine.adjustTarget(this.state, baseSlice);
    this.state.targetExtractionForCycle = adjusted;
  }

  onTick(fn: (snapshot: SimulationSnapshot) => void): void {
    this.onTickCallback = fn;
  }

  onComplete(fn: () => void): void {
    this.onCompleteCallback = fn;
  }

  onExhausted(fn: () => void): void {
    this.onExhaustedCallback = fn;
  }

  // ---- Simulation Loop ----
  private tick = (): void => {
    if (!this.running) return;
    const now = performance.now();

    if (!this.state.cycleActive && this.state.currentInfusion < this.state.numInfusions) {
      if (this.state.currentInfusion === 0) {
        this.state.currentInfusion = 1;
        this.state.cycleStartExtraction = this.state.extractionLevel;
        const baseSlice = 100.0 / (this.state.numInfusions || 1);
        const adjusted = this.engine.adjustTarget(this.state, baseSlice);
        this.state.targetExtractionForCycle = adjusted;
        this.state.resetCycle();
      } else {
        // Wait for user to trigger next; we just don't advance physics
      }
    }

    if (this.state.cycleActive) {
      this.engine.simulateStep(this.state, now);

      if (this.state.stopSignal) {
        this.state.cycleActive = false;
        this.state.aromaExtractionAxis = 0;
        this.state.aromaVolatilityAxis = 0;
        this.state.stopSignal = false;
        if (this.onCompleteCallback) this.onCompleteCallback();
      } else {
        const cycleProgress = this.state.extractionLevel - this.state.cycleStartExtraction;
        if (cycleProgress >= this.state.targetExtractionForCycle) {
          this.state.cycleActive = false;
          this.state.aromaExtractionAxis = 0;
          this.state.aromaVolatilityAxis = 0;
          const finalExt = Math.min(100.0, this.state.cycleStartExtraction + this.state.targetExtractionForCycle);
          this.state.extractionLevel = finalExt;
          if (this.onCompleteCallback) this.onCompleteCallback();
        }
      }
    }

    if (this.state.isExhausted && this.onExhaustedCallback) {
      this.onExhaustedCallback();
    }

    if (this.onTickCallback) {
      this.onTickCallback(this.buildSnapshot(now));
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  private buildSnapshot(now: number): SimulationSnapshot {
    const s = this.state;
    const elapsed = s.cycleActive || s.lastUpdateTime > s.cycleStartTime
      ? (s.cycleActive ? now - s.cycleStartTime : s.lastUpdateTime - s.cycleStartTime)
      : 0;
    const cycleProgress = Math.max(0, s.extractionLevel - s.cycleStartExtraction);
    const cycleTarget = s.targetExtractionForCycle;
    const cycleExtractionPercent = cycleTarget > 0 ? Math.min(100, (cycleProgress / cycleTarget) * 100) : 0;

    return new SimulationSnapshotBuilder()
      .withTimestamp(now)
      .withElapsed(elapsed)
      .withTemperature(s.currentTemp, s.useFahrenheit)
      .withExtractionLevel(s.extractionLevel)
      .withSaturationIndex(s.saturationIndex)
      .withHydrationState(s.hydrationState)
      .withUnfurlingState(s.unfurlingState)
      .withRates(s.astringencyRate, s.sweetnessRate, s.extVelocity)
      .withAromaAxes(s.aromaExtractionAxis, s.aromaVolatilityAxis)
      .withAminoAxes(s.aminoDepthAxis, s.aminoVibrancyAxis)
      .withClarityIndex(s.clarityIndex)
      .withDistributor(s.distributorPotential, s.distributorTargetHint)
      .withSignals(s.stopSignal, s.isExhausted, s.cycleActive)
      .withInfusion(s.currentInfusion, s.numInfusions)
      .withCycleExtractionPercent(cycleExtractionPercent)
      .withComponents(
        s.extCatechin,
        s.extAminoAcid,
        s.extCaffeine,
        s.extPectin,
        s.extPolysaccharide,
        s.extAroma,
      )
      .build();
  }
}
