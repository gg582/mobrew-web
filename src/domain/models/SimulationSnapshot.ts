import { Temperature } from './Temperature';
import { Percentage } from './Percentage';
import { ElapsedTime } from './ElapsedTime';

export class ExtractionComponents {
  constructor(
    readonly catechin: number,
    readonly aminoAcid: number,
    readonly caffeine: number,
    readonly pectin: number,
    readonly polysaccharide: number,
    readonly aroma: number,
  ) {}

  total(): number {
    return this.catechin + this.aminoAcid + this.caffeine + this.pectin + this.polysaccharide + this.aroma;
  }
}

export class SimulationSnapshot {
  constructor(
    readonly timestamp: number,
    readonly elapsed: ElapsedTime,
    readonly temperature: Temperature,
    readonly extractionLevel: Percentage,
    readonly saturationIndex: number,
    readonly hydrationState: number,
    readonly unfurlingState: number,
    readonly astringencyRate: number,
    readonly sweetnessRate: number,
    readonly extVelocity: number,
    readonly aromaExtractionAxis: number,
    readonly aromaVolatilityAxis: number,
    readonly aminoDepthAxis: number,
    readonly aminoVibrancyAxis: number,
    readonly clarityIndex: number,
    readonly distributorPotential: number,
    readonly distributorTargetHint: number,
    readonly stopSignal: boolean,
    readonly isExhausted: boolean,
    readonly cycleActive: boolean,
    readonly currentInfusion: number,
    readonly numInfusions: number,
    readonly components: ExtractionComponents,
    readonly cycleExtractionPercent: number = 0,
  ) {}

  get extractionPercent(): number {
    return this.extractionLevel.toPercent();
  }

  get elapsedMs(): number {
    return this.elapsed.toMilliseconds();
  }

  get formattedTime(): string {
    return this.elapsed.toFormattedString();
  }

  get saturationPercent(): number {
    return this.saturationIndex * 100;
  }

  get hydrationPercent(): number {
    return this.hydrationState * 100;
  }

  get unfurlingPercent(): number {
    return this.unfurlingState * 100;
  }
}
