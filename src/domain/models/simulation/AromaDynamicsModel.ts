import { SimulationModel } from './SimulationModel';
import type { TeaState } from '@/engine/TeaState';
import type { Tea } from '../tea/Tea';
import type { BrewVessel } from '../vessel/BrewVessel';
import type { SimulationContext } from './SimulationContext';
import { PHYSICS } from '@/data/constants';
import { AROMA_STOP_FLUX_MIN_EXT, AROMA_STOP_FLUX_MIN_VOL } from '@/data/teaProfiles';

export class AromaDynamicsModel extends SimulationModel {
  get id(): string { return 'model_aroma'; }

  step(
    state: TeaState,
    dtMin: number,
    tea: Tea,
    vessel: BrewVessel,
    context: SimulationContext,
  ): void {
    const compProfile = tea.getCompProfile();
    const temp = state.currentTemp;

    // Volatility
    let openness = vessel.getOpenness();
    if (state.hasButter) openness *= PHYSICS.BUTTER_OPENNESS_FACTOR;

    let volatilityRate = compProfile.aromaVolatilityBase * openness;
    let vaporDrive = Math.max(PHYSICS.VAPOR_DRIVE_MIN, Math.exp((temp - PHYSICS.VAPOR_DRIVE_TEMP_REF) / PHYSICS.VAPOR_DRIVE_SCALE));
    if (context.isActiveBoiling) vaporDrive *= PHYSICS.VAPOR_DRIVE_BOIL_FACTOR;
    volatilityRate *= vaporDrive;

    const availableAroma = state.extAroma;
    const aromaVolLoss = Math.min(availableAroma, availableAroma * volatilityRate * dtMin);
    const aromaRetained = Math.max(0.0, availableAroma - aromaVolLoss);

    state.extAroma = aromaRetained;

    const aromaPerceptionFloorRatio = tea.getAromaPerceptionFloor();
    const aromaPerceptionFloorMass = compProfile.sAroma > 0 ? compProfile.sAroma * aromaPerceptionFloorRatio : 0;
    const aromaFloorMet = compProfile.sAroma <= 0 || aromaRetained + 1e-6 >= aromaPerceptionFloorMass;

    const aromaExtRate = state.aromaExtractionAxis;
    const aromaVolRate = dtMin > 0 ? aromaVolLoss / dtMin : 0.0;
    state.aromaVolatilityAxis = aromaVolRate;

    const aromaCaptureRatio = compProfile.sAroma > 0 ? clamp(aromaRetained / compProfile.sAroma, 0.0, 1.2) : 0.0;
    const aromaGuardMargin = aromaExtRate - aromaVolRate;
    const aromaBalanceRatio = aromaExtRate > 1e-6 ? aromaVolRate / (aromaExtRate + 1e-6) : 0.0;

    const liveFluxGate = aromaExtRate >= AROMA_STOP_FLUX_MIN_EXT && aromaVolRate >= AROMA_STOP_FLUX_MIN_VOL;

    // Projection
    let projectedAromaBalance = aromaBalanceRatio;
    let projectedGuardMargin = aromaGuardMargin;
    let projectedAromaExtRate = aromaExtRate;
    let projectedAromaVolRate = aromaVolRate;
    if (dtMin > 0) {
      const kAroma = this.calculateKAroma(state, tea, context);
      const remainingAroma = Math.max(0.0, compProfile.sAroma - (state.extAroma + (context.deAroma ?? 0)));
      const projectedDeAroma = Math.max(0.0, kAroma * remainingAroma * dtMin);
      const nextExtRate = projectedDeAroma / dtMin;
      const nextAvailableAroma = aromaRetained + projectedDeAroma;
      const projectedVolLoss = Math.min(nextAvailableAroma, nextAvailableAroma * volatilityRate * dtMin);
      const nextVolRate = projectedVolLoss / dtMin;
      projectedAromaExtRate = nextExtRate;
      projectedAromaVolRate = nextVolRate;
      projectedGuardMargin = nextExtRate - nextVolRate;
      projectedAromaBalance = nextExtRate > 1e-6 ? nextVolRate / (nextExtRate + 1e-6) : (nextVolRate > 0.0 ? 5.0 : 0.0);
    }
    const projectedFluxGate = projectedAromaExtRate >= AROMA_STOP_FLUX_MIN_EXT && projectedAromaVolRate >= AROMA_STOP_FLUX_MIN_VOL;

    const ratioGuardMs = this.computeRatioDiffusionGuardMs(state);
    void (context.elapsedMs >= ratioGuardMs);

    let aromaBalanceQuality = 0.0;
    let aromaBalanceCut = false;
    if (!context.isActiveBoiling) {
      const tolerance = tea.getAromaBalanceTolerance();
      const perceptFloor = aromaPerceptionFloorRatio;
      const minRate = tea.getAromaSignalFloor();
      let minElapsedMs = tea.getAromaBalanceMinTimeMs();
      if (minElapsedMs < ratioGuardMs) minElapsedMs = ratioGuardMs;
      const projectionThreshold = PHYSICS.PROJECTION_THRESHOLD;
      const balancePerceptionGate = clamp(perceptFloor + tolerance * 0.5, perceptFloor, 0.9);

      if (aromaCaptureRatio >= balancePerceptionGate && liveFluxGate &&
          projectedAromaExtRate >= minRate && projectedAromaVolRate >= minRate * 0.5 &&
          projectedFluxGate && projectedAromaBalance >= projectionThreshold &&
          projectedGuardMargin <= 0.0 && context.elapsedMs >= minElapsedMs) {
        aromaBalanceCut = true;
        const overshoot = projectedAromaBalance - projectionThreshold;
        const normalized = clamp(overshoot / (tolerance + 1e-6), 0.0, 1.0);
        aromaBalanceQuality = 1.0 - normalized;
      }
    }

    const deAmi = context.deAminoAcid ?? 0;
    const eAmiCurr = state.extAminoAcid - deAmi;
    const aminoRatio = compProfile.sAminoAcid > 0 ? clamp((eAmiCurr + deAmi) / compProfile.sAminoAcid, 0.0, 1.2) : 0.0;
    state.aminoDepthAxis = aminoRatio;
    const aminoRate = dtMin > 0 ? deAmi / dtMin : 0.0;
    state.aminoVibrancyAxis = aminoRate;

    // Store in context
    context.aromaVolLoss = aromaVolLoss;
    context.aromaRetained = aromaRetained;
    context.aromaBalanceCut = aromaBalanceCut;
    context.aromaBalanceQuality = aromaBalanceQuality;
    context.aromaFloorMet = aromaFloorMet;
  }

  private calculateKAroma(state: TeaState, tea: Tea, context: SimulationContext): number {
    const compProfile = tea.getCompProfile();
    const temp = state.currentTemp;
    let k = compProfile.kAroma * Math.exp(compProfile.sensAroma * (temp - 100.0) / 30.0);
    k *= context.hydrationFactor * context.surfaceFactor;
    const tds = state.tds;
    if (tds > PHYSICS.WATER_FACTOR_TDS_BASE) {
      const waterFactor = Math.max(PHYSICS.WATER_FACTOR_MIN, 1.0 - ((tds - PHYSICS.WATER_FACTOR_TDS_BASE) / PHYSICS.WATER_FACTOR_TDS_SCALE));
      k *= waterFactor;
    }
    return k * context.lagPenalty * context.turbulenceFactor * context.vesselExtractionFactor;
  }

  private computeRatioDiffusionGuardMs(state: TeaState): number {
    let leafMass = Math.max(PHYSICS.MIN_LEAF_MASS, state.leafMass);
    let waterVolume = state.waterVolumeMl || PHYSICS.DEFAULT_WATER_VOLUME;
    const ratio = waterVolume / leafMass;
    const normalized = clamp((ratio - PHYSICS.RATIO_GONGFU) / (PHYSICS.RATIO_WESTERN - PHYSICS.RATIO_GONGFU), 0.0, 1.0);
    let baseTimeSec = PHYSICS.RATIO_DIFFUSION_MIN_SEC + normalized * (PHYSICS.RATIO_DIFFUSION_MAX_SEC - PHYSICS.RATIO_DIFFUSION_MIN_SEC);
    if (ratio > PHYSICS.RATIO_WESTERN) {
      const excess = clamp((ratio - PHYSICS.RATIO_WESTERN) / PHYSICS.RATIO_EXCESS_SCALE, 0.0, 1.0);
      baseTimeSec += excess * PHYSICS.RATIO_EXCESS_BONUS;
    }
    const hydration = clamp(state.hydrationState, 0.0, 1.0);
    const hydrationRelief = 1.0 - PHYSICS.RATIO_HYDRATION_RELIEF_MAX * hydration;
    baseTimeSec *= clamp(hydrationRelief, 0.65, 1.0);
    return Math.max(PHYSICS.RATIO_BASE_MIN_SEC, baseTimeSec) * 1000.0;
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
