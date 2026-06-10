import { SimulationSnapshot, ExtractionComponents } from './SimulationSnapshot';
import { Temperature } from './Temperature';
import { Percentage } from './Percentage';
import { ElapsedTime } from './ElapsedTime';

export class SimulationSnapshotBuilder {
  private timestamp = 0;
  private elapsed = ElapsedTime.fromMilliseconds(0);
  private temperature = Temperature.fromCelsius(0);
  private extractionLevel = Percentage.fromPercent(0);
  private saturationIndex = 0;
  private hydrationState = 0;
  private unfurlingState = 0;
  private astringencyRate = 0;
  private sweetnessRate = 0;
  private extVelocity = 0;
  private aromaExtractionAxis = 0;
  private aromaVolatilityAxis = 0;
  private aminoDepthAxis = 0;
  private aminoVibrancyAxis = 0;
  private clarityIndex = 0;
  private distributorPotential = 0;
  private distributorTargetHint = 0;
  private stopSignal = false;
  private isExhausted = false;
  private cycleActive = false;
  private currentInfusion = 0;
  private numInfusions = 1;
  private components = new ExtractionComponents(0, 0, 0, 0, 0, 0);
  private cycleExtractionPercent = 0;

  withTimestamp(ts: number): this {
    this.timestamp = ts;
    return this;
  }

  withElapsed(ms: number): this {
    this.elapsed = ElapsedTime.fromMilliseconds(ms);
    return this;
  }

  withTemperature(celsius: number, useFahrenheit = false): this {
    this.temperature = useFahrenheit
      ? Temperature.fromFahrenheit(celsius)
      : Temperature.fromCelsius(celsius);
    return this;
  }

  withExtractionLevel(percent: number): this {
    this.extractionLevel = Percentage.fromPercent(percent);
    return this;
  }

  withSaturationIndex(index: number): this {
    this.saturationIndex = index;
    return this;
  }

  withHydrationState(state: number): this {
    this.hydrationState = state;
    return this;
  }

  withUnfurlingState(state: number): this {
    this.unfurlingState = state;
    return this;
  }

  withRates(astringency: number, sweetness: number, velocity: number): this {
    this.astringencyRate = astringency;
    this.sweetnessRate = sweetness;
    this.extVelocity = velocity;
    return this;
  }

  withAromaAxes(extraction: number, volatility: number): this {
    this.aromaExtractionAxis = extraction;
    this.aromaVolatilityAxis = volatility;
    return this;
  }

  withAminoAxes(depth: number, vibrancy: number): this {
    this.aminoDepthAxis = depth;
    this.aminoVibrancyAxis = vibrancy;
    return this;
  }

  withClarityIndex(index: number): this {
    this.clarityIndex = index;
    return this;
  }

  withDistributor(potential: number, targetHint: number): this {
    this.distributorPotential = potential;
    this.distributorTargetHint = targetHint;
    return this;
  }

  withSignals(stop: boolean, exhausted: boolean, active: boolean): this {
    this.stopSignal = stop;
    this.isExhausted = exhausted;
    this.cycleActive = active;
    return this;
  }

  withInfusion(current: number, total: number): this {
    this.currentInfusion = current;
    this.numInfusions = total;
    return this;
  }

  withCycleExtractionPercent(percent: number): this {
    this.cycleExtractionPercent = percent;
    return this;
  }

  withComponents(
    catechin: number,
    aminoAcid: number,
    caffeine: number,
    pectin: number,
    polysaccharide: number,
    aroma: number,
  ): this {
    this.components = new ExtractionComponents(catechin, aminoAcid, caffeine, pectin, polysaccharide, aroma);
    return this;
  }

  fromRaw(raw: {
    timestamp: number;
    elapsedMs: number;
    temperature: number;
    extractionLevel: number;
    saturationIndex: number;
    hydrationState: number;
    unfurlingState: number;
    astringencyRate: number;
    sweetnessRate: number;
    extVelocity: number;
    aromaExtractionAxis: number;
    aromaVolatilityAxis: number;
    aminoDepthAxis: number;
    aminoVibrancyAxis: number;
    clarityIndex: number;
    distributorPotential: number;
    distributorTargetHint: number;
    stopSignal: boolean;
    isExhausted: boolean;
    cycleActive: boolean;
    currentInfusion: number;
    numInfusions: number;
    components: { catechin: number; aminoAcid: number; caffeine: number; pectin: number; polysaccharide: number; aroma: number };
    cycleExtractionPercent?: number;
  }): this {
    this.timestamp = raw.timestamp;
    this.elapsed = ElapsedTime.fromMilliseconds(raw.elapsedMs);
    this.temperature = Temperature.fromCelsius(raw.temperature);
    this.extractionLevel = Percentage.fromPercent(raw.extractionLevel);
    this.saturationIndex = raw.saturationIndex;
    this.hydrationState = raw.hydrationState;
    this.unfurlingState = raw.unfurlingState;
    this.astringencyRate = raw.astringencyRate;
    this.sweetnessRate = raw.sweetnessRate;
    this.extVelocity = raw.extVelocity;
    this.aromaExtractionAxis = raw.aromaExtractionAxis;
    this.aromaVolatilityAxis = raw.aromaVolatilityAxis;
    this.aminoDepthAxis = raw.aminoDepthAxis;
    this.aminoVibrancyAxis = raw.aminoVibrancyAxis;
    this.clarityIndex = raw.clarityIndex;
    this.distributorPotential = raw.distributorPotential;
    this.distributorTargetHint = raw.distributorTargetHint;
    this.stopSignal = raw.stopSignal;
    this.isExhausted = raw.isExhausted;
    this.cycleActive = raw.cycleActive;
    this.currentInfusion = raw.currentInfusion;
    this.numInfusions = raw.numInfusions;
    this.components = new ExtractionComponents(
      raw.components.catechin,
      raw.components.aminoAcid,
      raw.components.caffeine,
      raw.components.pectin,
      raw.components.polysaccharide,
      raw.components.aroma,
    );
    this.cycleExtractionPercent = raw.cycleExtractionPercent ?? 0;
    return this;
  }

  build(): SimulationSnapshot {
    return new SimulationSnapshot(
      this.timestamp,
      this.elapsed,
      this.temperature,
      this.extractionLevel,
      this.saturationIndex,
      this.hydrationState,
      this.unfurlingState,
      this.astringencyRate,
      this.sweetnessRate,
      this.extVelocity,
      this.aromaExtractionAxis,
      this.aromaVolatilityAxis,
      this.aminoDepthAxis,
      this.aminoVibrancyAxis,
      this.clarityIndex,
      this.distributorPotential,
      this.distributorTargetHint,
      this.stopSignal,
      this.isExhausted,
      this.cycleActive,
      this.currentInfusion,
      this.numInfusions,
      this.components,
      this.cycleExtractionPercent,
    );
  }
}
