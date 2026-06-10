import { DomainObject } from '../base/DomainObject';
import type { TeaState } from '@/engine/TeaState';
import type { Tea } from '../tea/Tea';
import { TeaFactory } from '@/domain/factories/TeaFactory';
import { PHYSICS } from '@/data/constants';

export class DistributorModel extends DomainObject {
  get id(): string { return 'model_distributor'; }

  refresh(state: TeaState, tea: Tea): void {
    const compProfile = tea.getCompProfile();
    const tp = tea.getProfile();

    const width = state.leafWidth || PHYSICS.DEFAULT_LEAF_WIDTH;
    const height = state.leafHeight || PHYSICS.DEFAULT_LEAF_HEIGHT;
    const dominant = Math.max(height, width);
    const lengthFactor = Math.tanh(dominant / 45.0) + 0.5;
    const areaCm2 = Math.max(PHYSICS.MIN_AREA_CM2, (width * height) / 100.0);
    const density = Math.max(0.25, state.leafDensity || tp.leafDensity);
    const perLeafMass = Math.max(PHYSICS.MIN_PER_LEAF_MASS, density * areaCm2 * PHYSICS.LEAF_THICKNESS_CM);
    const leafMass = Math.max(PHYSICS.DEFAULT_LEAF_MASS, state.leafMass);
    const leafCount = Math.max(PHYSICS.MIN_LEAF_COUNT, leafMass / perLeafMass);
    const geometryFactor = clamp(
      PHYSICS.GEO_BASE + PHYSICS.GEO_LEAF_FACTOR * (leafCount / (leafCount + 4.0)) + PHYSICS.GEO_LENGTH_FACTOR * lengthFactor,
      PHYSICS.GEO_CLAMP_MIN,
      PHYSICS.GEO_CLAMP_MAX,
    );

    const totalSolublesPerG = compProfile.sCatechin + compProfile.sAminoAcid + compProfile.sCaffeine + compProfile.sPectin + compProfile.sPolysaccharide;
    const totalSolids = totalSolublesPerG * leafMass;
    const extractedPct = clamp(state.extractionLevel / 100.0, 0.0, 1.0);
    const remainingSolids = totalSolids * (1.0 - extractedPct);
    const waterVolume = Math.max(30.0, state.waterVolumeMl);
    const potentialConc = (remainingSolids * geometryFactor) / waterVolume;
    state.distributorPotential = potentialConc;

    const hydration = Math.max(0.05, state.hydrationState);
    const expectedRate = tp.baseVelocity * (0.8 + 0.2 * geometryFactor) * Math.sqrt(hydration);
    const actualRate = state.extVelocity > 0.0 ? state.extVelocity / 100.0 : expectedRate;
    state.distributorDragRatio = clamp(actualRate / expectedRate, PHYSICS.DISTRIBUTOR_CLAMP_LOW, 1.8);
  }

  adjustTarget(state: TeaState, baseSlicePct: number): number {
    if (baseSlicePct <= 0.0 || state.numInfusions === 0) return baseSlicePct;

    const tea = TeaFactory.create(state.teaType);
    const tp = tea.getProfile();

    this.refresh(state, tea);

    let infusionsLeft = state.numInfusions - state.currentInfusion + 1;
    if (infusionsLeft < 1) infusionsLeft = 1;

    const remainingPct = Math.max(0.0, 100.0 - state.extractionLevel);
    const baseRemaining = remainingPct / infusionsLeft;
    let slice = Math.min(baseSlicePct, baseRemaining);

    const potential = state.distributorPotential || 10.0;
    const concRatio = clamp(potential / PHYSICS.POTENTIAL_CONC_NORM, 0.5, 1.6);

    const width = state.leafWidth || PHYSICS.DEFAULT_LEAF_WIDTH;
    const height = state.leafHeight || PHYSICS.DEFAULT_LEAF_HEIGHT;
    const dominant = Math.max(height, width);
    const lengthFactor = Math.tanh(dominant / 45.0) + 0.5;
    const velocityFactor = clamp(tp.baseVelocity / PHYSICS.VELOCITY_FACTOR_REF, PHYSICS.VELOCITY_CLAMP_MIN, PHYSICS.VELOCITY_CLAMP_MAX);
    const dragRatio = state.distributorDragRatio || 1.0;

    let distributionFactor = (concRatio + velocityFactor + lengthFactor) / 3.0;
    distributionFactor = clamp(distributionFactor * dragRatio, PHYSICS.DISTRIBUTOR_CLAMP_LOW, PHYSICS.DISTRIBUTOR_CLAMP_HIGH);

    let adjusted = slice * distributionFactor;
    const minSlice = baseRemaining * PHYSICS.DISTRIBUTOR_MIN_SLICE;
    adjusted = Math.max(minSlice, Math.min(remainingPct, adjusted));
    state.distributorTargetHint = adjusted;
    return adjusted;
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
