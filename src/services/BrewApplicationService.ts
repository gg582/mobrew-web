import { BrewFacade } from '@/facades/BrewFacade';
import { eventBus } from '@/core/events/EventBus';
import { BrewingRegion, TeaType } from '@/domain/enums';
import { SimulationSnapshotBuilder } from '@/domain/models/SimulationSnapshotBuilder';
import type { SimulationSnapshot, TeaStateData } from '@/domain/types';

export class BrewApplicationService {
  private facade: BrewFacade = new BrewFacade();
  private running = false;

  constructor() {
    this.facade.onTick((snap) => {
      eventBus.emit('simulation:tick', snap);
    });
    this.facade.onComplete(() => {
      eventBus.emit('simulation:complete', null);
    });
    this.facade.onExhausted(() => {
      eventBus.emit('simulation:exhausted', null);
    });
  }

  startSimple(region: BrewingRegion, tea: TeaType): void {
    this.facade = new BrewFacade();
    this.setupCallbacks();
    this.facade.applyRegionPreset(region, tea);
    this.start();
  }

  startAdvanced(config: Partial<TeaStateData>): void {
    this.facade = new BrewFacade();
    this.setupCallbacks();
    this.facade.applyExpertConfig(config as any);
    this.start();
  }

  pause(): void {
    this.facade.stopSession();
    this.running = false;
    eventBus.emit('simulation:paused', null);
  }

  resume(): void {
    this.facade.startSession();
    this.running = true;
    eventBus.emit('simulation:resumed', null);
  }

  reset(): void {
    this.facade.stopSession();
    this.running = false;
    eventBus.emit('simulation:reset', null);
  }

  nextInfusion(temp: number, volume: number): void {
    this.facade.nextInfusion(temp, volume);
    eventBus.emit('simulation:next', null);
  }

  getSnapshot(): SimulationSnapshot | null {
    const s = this.facade.cloneState();
    const now = performance.now();
    const elapsed = s.cycleActive || s.lastUpdateTime > s.cycleStartTime
      ? (s.cycleActive ? now - s.cycleStartTime : s.lastUpdateTime - s.cycleStartTime)
      : 0;
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
      .withComponents(s.extCatechin, s.extAminoAcid, s.extCaffeine, s.extPectin, s.extPolysaccharide, s.extAroma)
      .build();
  }

  isRunning(): boolean {
    return this.running;
  }

  private setupCallbacks(): void {
    this.facade.onTick((snap) => eventBus.emit('simulation:tick', snap));
    this.facade.onComplete(() => eventBus.emit('simulation:complete', null));
    this.facade.onExhausted(() => eventBus.emit('simulation:exhausted', null));
  }

  private start(): void {
    this.facade.startSession();
    this.running = true;
    eventBus.emit('simulation:started', null);
  }
}

export const brewService = new BrewApplicationService();
