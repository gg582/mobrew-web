import { SimulationModel } from './SimulationModel';
import type { TeaState } from '@/engine/TeaState';
import type { Tea } from '../tea/Tea';
import type { BrewVessel } from '../vessel/BrewVessel';
import type { SimulationContext } from './SimulationContext';
import { PHYSICS } from '@/data/constants';

export class ComponentExtractionModel extends SimulationModel {
  get id(): string { return 'model_extraction'; }

  step(
    state: TeaState,
    dtMin: number,
    tea: Tea,
    vessel: BrewVessel,
    context: SimulationContext,
  ): void {
    const compProfile = tea.getCompProfile();
    const vprops = vessel.getProps();
    const sh = vprops.specificHeat;

    const eCatCurr = state.extCatechin;
    const eAmiCurr = state.extAminoAcid;
    const eCafCurr = state.extCaffeine;
    const ePecCurr = state.extPectin;
    const ePolCurr = state.extPolysaccharide;
    const eLigCurr = state.extLignin;
    const eAromaCurr = state.extAroma;

    const eCat = eCatCurr + state.accumExtCatechin;
    const eAmi = eAmiCurr + state.accumExtAminoAcid;
    const eCaf = eCafCurr + state.accumExtCaffeine;
    const ePec = ePecCurr + state.accumExtPectin;
    const ePol = ePolCurr + state.accumExtPolysaccharide;
    const eLig = eLigCurr + state.accumExtLignin;
    const eAroma = eAromaCurr + state.accumExtAroma;

    const { lagPenalty, turbulenceFactor, vesselExtractionFactor, hydrationFactor, surfaceFactor } = context;

    const kCat = this.calculateComponentK(state, compProfile.kCatechin, compProfile.sensCatechin, hydrationFactor) * lagPenalty * turbulenceFactor * vesselExtractionFactor;
    const kAmi = this.calculateComponentK(state, compProfile.kAminoAcid, compProfile.sensAminoAcid, hydrationFactor) * lagPenalty * turbulenceFactor * vesselExtractionFactor;
    const kCaf = this.calculateComponentK(state, compProfile.kCaffeine, compProfile.sensCaffeine, hydrationFactor) * lagPenalty * turbulenceFactor * vesselExtractionFactor;
    const kPol = this.calculateComponentK(state, compProfile.kPolysaccharide, compProfile.sensPolysaccharide, hydrationFactor) * lagPenalty * turbulenceFactor * vesselExtractionFactor;
    const kAroma = this.calculateComponentK(state, compProfile.kAroma, compProfile.sensAroma, hydrationFactor * surfaceFactor) * lagPenalty * turbulenceFactor * vesselExtractionFactor;
    const thermalPressure = sh / 0.8;
    const kPec = this.calculateComponentK(state, compProfile.kPectin * thermalPressure, compProfile.sensPectin, hydrationFactor) * lagPenalty * turbulenceFactor * vesselExtractionFactor;

    const deAroma = Math.max(0.0, kAroma * (compProfile.sAroma - eAroma) * dtMin);

    // Lignin
    let kLig = 0.0;
    const sLignin = PHYSICS.S_LIGNIN;
    if (state.structuralIntegrity < PHYSICS.INTEGRITY_RUPTURE_THRESHOLD) {
      kLig = PHYSICS.K_LIG_BASE * (1.0 - state.structuralIntegrity / PHYSICS.INTEGRITY_RUPTURE_THRESHOLD) * turbulenceFactor;
    }

    const deCat = kCat * (compProfile.sCatechin - eCat) * dtMin;
    const deAmi = kAmi * (compProfile.sAminoAcid - eAmi) * dtMin;
    const deCaf = kCaf * (compProfile.sCaffeine - eCaf) * dtMin;

    let clarityBias = 1.0;
    if (!context.isActiveBoiling) {
      const satPrev = clamp(1.0 - state.saturationIndex, 0.15, 0.95);
      clarityBias = PHYSICS.CLARITY_BIAS_BASE + PHYSICS.CLARITY_BIAS_RANGE * satPrev;
    }

    const dePec = kPec * (compProfile.sPectin - ePec) * dtMin * clarityBias;
    const dePol = kPol * (compProfile.sPolysaccharide - ePol) * dtMin * clarityBias;
    const deLig = kLig * (sLignin - eLig) * dtMin;

    state.extCatechin = eCatCurr + deCat;
    state.extAminoAcid = eAmiCurr + deAmi;
    state.extCaffeine = eCafCurr + deCaf;
    state.extPectin = ePecCurr + dePec;
    state.extPolysaccharide = ePolCurr + dePol;
    state.extLignin = eLigCurr + deLig;
    state.extAroma = eAromaCurr + deAroma;

    const currentVol = Math.max(PHYSICS.MIN_WATER_VOLUME, state.waterVolumeMl);
    const lMass = Math.max(PHYSICS.MIN_LEAF_MASS, state.leafMass);
    const heavySolutesConc = ((ePec + dePec) * 1.5 + (ePol + dePol) * 1.0 + (eLig + deLig) * 2.0) * lMass / currentVol;
    state.clarityIndex = heavySolutesConc;

    const aromaExtRate = dtMin > 0 ? deAroma / dtMin : 0.0;
    state.aromaExtractionAxis = aromaExtRate;

    // Store deltas in context for downstream models
    context.deCatechin = deCat;
    context.deAminoAcid = deAmi;
    context.deCaffeine = deCaf;
    context.dePectin = dePec;
    context.dePolysaccharide = dePol;
    context.deLignin = deLig;
    context.deAroma = deAroma;
  }

  private calculateComponentK(state: TeaState, baseK: number, sens: number, hydrationFactor: number): number {
    const temp = state.currentTemp;
    let k = baseK * Math.exp(sens * (temp - 100.0) / 30.0);
    k *= hydrationFactor;
    const tds = state.tds;
    if (tds > PHYSICS.WATER_FACTOR_TDS_BASE) {
      const waterFactor = Math.max(PHYSICS.WATER_FACTOR_MIN, 1.0 - ((tds - PHYSICS.WATER_FACTOR_TDS_BASE) / PHYSICS.WATER_FACTOR_TDS_SCALE));
      k *= waterFactor;
    }
    return k;
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
