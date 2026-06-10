import { SimulationModel } from './SimulationModel';
import type { TeaState } from '@/engine/TeaState';
import type { Tea } from '../tea/Tea';
import type { BrewVessel } from '../vessel/BrewVessel';
import type { SimulationContext } from './SimulationContext';
import { PHYSICS } from '@/data/constants';

export class TerminationModel extends SimulationModel {
  get id(): string { return 'model_termination'; }

  step(
    state: TeaState,
    dtMin: number,
    tea: Tea,
    _vessel: BrewVessel,
    context: SimulationContext,
  ): void {
    const compProfile = tea.getCompProfile();

    const deCat = context.deCatechin ?? 0;
    const deAmi = context.deAminoAcid ?? 0;
    const deCaf = context.deCaffeine ?? 0;
    const dePec = context.dePectin ?? 0;
    const dePol = context.dePolysaccharide ?? 0;

    const eCat = state.extCatechin + state.accumExtCatechin;
    const eAmi = state.extAminoAcid + state.accumExtAminoAcid;
    const eCaf = state.extCaffeine + state.accumExtCaffeine;
    const ePec = state.extPectin + state.accumExtPectin;
    const ePol = state.extPolysaccharide + state.accumExtPolysaccharide;

    const rCat = (eCat + deCat) / compProfile.sCatechin;
    const rCaf = (eCaf + deCaf) / compProfile.sCaffeine;
    const rAmi = (eAmi + deAmi) / compProfile.sAminoAcid;
    const rPol = (ePol + dePol) / compProfile.sPolysaccharide;
    const rPec = (ePec + dePec) / compProfile.sPectin;

    const satIdx = (rCat + rAmi + rCaf + rPec + rPol) / 5.0;
    state.saturationIndex = satIdx;
    if (satIdx > PHYSICS.SATURATION_EXHAUSTION) state.isExhausted = true;

    const dbDt = ((deCat / compProfile.sCatechin) * 0.7 + (deCaf / compProfile.sCaffeine) * 0.3) / dtMin;
    const dsDt = ((deAmi / compProfile.sAminoAcid) * 0.4 + (dePol / compProfile.sPolysaccharide) * 0.4 + (dePec / compProfile.sPectin) * 0.2) / dtMin;

    const prevDbDt = state.astringencyRate;
    const _d2bDt2 = (dbDt - prevDbDt) / dtMin;
    const _d2sDt2 = (dsDt - state.sweetnessRate) / dtMin;

    state.astringencyRate = dbDt;
    state.sweetnessRate = dsDt;

    let overrideProgress = -1.0;
    let styleOverride = false;

    if (!context.isActiveBoiling) {
      const aromaMassFull = PHYSICS.AROMA_MASS_FULL;
      const aromaMassMin = PHYSICS.AROMA_MASS_MIN;
      const aromaRatioGate = PHYSICS.AROMA_RATIO_GATE;
      const currentAromaMass = context.aromaRetained ?? 0;
      const aromaExtRate = state.aromaExtractionAxis;
      const aromaVolRate = state.aromaVolatilityAxis;
      const fluxPresent = aromaExtRate > 1e-6 && aromaVolRate > 1e-6;
      let aromaMassCut = false;
      let aromaMassProgress = -1.0;

      const aromaBalanceRatio = aromaExtRate > 1e-6 ? aromaVolRate / (aromaExtRate + 1e-6) : 0.0;
      const ratioGuardMs = this.computeRatioDiffusionGuardMs(state);
      const ratioGuardMet = context.elapsedMs >= ratioGuardMs;

      if (ratioGuardMet && fluxPresent && currentAromaMass >= aromaMassFull) {
        aromaMassCut = true;
      } else if (ratioGuardMet && fluxPresent && currentAromaMass >= aromaMassMin && aromaBalanceRatio >= aromaRatioGate) {
        aromaMassCut = true;
      }
      if (aromaMassCut) {
        aromaMassProgress = clamp(currentAromaMass / aromaMassFull, 0.0, 1.25) * 100.0;
      }

      const aromaCaptureRatio = compProfile.sAroma > 0 ? clamp(currentAromaMass / compProfile.sAroma, 0.0, 1.2) : 0.0;
      const aromaGuardMargin = aromaExtRate - aromaVolRate;
      const aromaSafetyRatio = aromaExtRate > 0.0 ? clamp(aromaGuardMargin / (aromaExtRate + 1e-6), -1.0, 1.0) : 0.0;
      const aromaticWindowScore = aromaCaptureRatio * 0.7 + (0.5 + 0.5 * aromaSafetyRatio) * 0.3;
      const aromaticWindow = fluxPresent && aromaCaptureRatio >= PHYSICS.AROMA_CAPTURE_THRESHOLD && aromaGuardMargin > PHYSICS.AROMA_GUARD_MARGIN_MIN && aromaticWindowScore > PHYSICS.AROMATIC_WINDOW_SCORE_MIN;
      const aminoRatio = state.aminoDepthAxis;
      const aminoRate = state.aminoVibrancyAxis;
      const aminoWindow = aminoRatio >= PHYSICS.AMINO_DEPTH_MIN && aminoRate >= PHYSICS.AMINO_VIBRANCY_MIN;
      const balanceProgress = (context.aromaBalanceCut ?? false) ? (aromaCaptureRatio * 0.6 + (context.aromaBalanceQuality ?? 0) * 0.4) * 100.0 : -1.0;

      if ((context.aromaBalanceCut ?? false) || aromaMassCut) {
        styleOverride = true;
        state.stopSignal = true;
        const progressFloor = satIdx * 100.0;
        let candidate = -1.0;
        if (balanceProgress >= 0.0) candidate = balanceProgress;
        if (aromaMassCut && aromaMassProgress >= 0.0 && (candidate < 0.0 || aromaMassProgress < candidate)) {
          candidate = aromaMassProgress;
        }
        if (candidate < progressFloor) candidate = progressFloor;
        overrideProgress = candidate;
      } else if (aromaticWindow && aminoWindow && ratioGuardMet) {
        styleOverride = true;
        state.stopSignal = true;
        let aromaticProgress = (aromaCaptureRatio * 0.65 + aminoRatio * 0.35) * 100.0;
        const progressFloor = satIdx * 100.0;
        if (aromaticProgress < progressFloor) aromaticProgress = progressFloor;
        overrideProgress = aromaticProgress;
      }

      const heavySolutesConc = state.clarityIndex;
      if (heavySolutesConc > PHYSICS.CLARITY_TARGET) {
        styleOverride = true;
        state.stopSignal = true;
        const clarityRatio = clamp(PHYSICS.CLARITY_TARGET / heavySolutesConc, 0.45, 1.0);
        const clarityProgress = satIdx * 100.0 * clarityRatio;
        if (overrideProgress < 0.0 || clarityProgress < overrideProgress) {
          overrideProgress = clarityProgress;
        }
      }
    }

    if (context.isActiveBoiling) {
      const ePec = state.extPectin + state.accumExtPectin;
      const ePol = state.extPolysaccharide + state.accumExtPolysaccharide;
      const eLig = state.extLignin + state.accumExtLignin;
      const lMass = Math.max(PHYSICS.MIN_LEAF_MASS, state.leafMass);
      const currentVol = Math.max(PHYSICS.MIN_WATER_VOLUME, state.waterVolumeMl);
      const decoctionConc = (ePec * 1.5 + ePol * 1.0 + eLig * 2.0) * lMass / currentVol;
      const targetViscosity = PHYSICS.DECOCTION_VISCOSITY_TARGET;
      if (decoctionConc >= targetViscosity && context.elapsedMs > PHYSICS.MIN_INFUSION_MS) {
        state.stopSignal = true;
      } else {
        state.stopSignal = false;
      }
      const viscProgress = (decoctionConc / targetViscosity) * 100.0;
      state.extractionLevel = Math.max(state.extractionLevel, viscProgress);
    } else if (!styleOverride) {
      const aromaFloorMet = context.aromaFloorMet ?? false;
      const ratioGuardMs = this.computeRatioDiffusionGuardMs(state);
      const ratioGuardMet = context.elapsedMs >= ratioGuardMs;
      if (aromaFloorMet && ratioGuardMet && _d2bDt2 > _d2sDt2) {
        state.stopSignal = true;
      } else {
        state.stopSignal = false;
      }
    }

    if (!context.isActiveBoiling) {
      const progress = satIdx * 100.0;
      if (styleOverride) {
        const finalProgress = overrideProgress >= 0.0 ? overrideProgress : progress;
        state.extractionLevel = finalProgress;
      } else {
        state.extractionLevel = progress;
      }
    }

    state.extVelocity = dsDt * 100.0;
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
