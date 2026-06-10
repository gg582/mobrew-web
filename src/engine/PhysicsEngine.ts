import { TeaState } from './TeaState';
import { VesselType } from '@/domain/enums';
import { TeaFactory } from '@/domain/factories/TeaFactory';
import { VesselFactory } from '@/domain/factories/VesselFactory';
import { PHYSICS } from '@/data/constants';
import { HydrationModel } from '@/domain/models/simulation/HydrationModel';
import { UnfurlingModel } from '@/domain/models/simulation/UnfurlingModel';
import { CoolingModel } from '@/domain/models/simulation/CoolingModel';
import { BoilingModel } from '@/domain/models/simulation/BoilingModel';
import { StructuralIntegrityModel } from '@/domain/models/simulation/StructuralIntegrityModel';
import { ComponentExtractionModel } from '@/domain/models/simulation/ComponentExtractionModel';
import { AromaDynamicsModel } from '@/domain/models/simulation/AromaDynamicsModel';
import { TerminationModel } from '@/domain/models/simulation/TerminationModel';
import { DistributorModel } from '@/domain/models/simulation/DistributorModel';
import type { SimulationContext } from '@/domain/models/simulation/SimulationContext';

/**
 * 물리 엔진.
 * 여러 시뮬레이션 모델을 구성으로 포함하여 오케스트레이션합니다.
 */
export class PhysicsEngine {
  // Composition: PhysicsEngine has-a simulation models
  private readonly hydrationModel = new HydrationModel();
  private readonly unfurlingModel = new UnfurlingModel();
  private readonly coolingModel = new CoolingModel();
  private readonly boilingModel = new BoilingModel();
  private readonly integrityModel = new StructuralIntegrityModel();
  private readonly extractionModel = new ComponentExtractionModel();
  private readonly aromaModel = new AromaDynamicsModel();
  private readonly terminationModel = new TerminationModel();
  private readonly distributorModel = new DistributorModel();

  simulateStep(state: TeaState, now: number): void {
    if (now <= state.lastUpdateTime) return;
    const dtMin = (now - state.lastUpdateTime) / 1000.0 / 60.0;
    if (dtMin <= 0) return;

    const elapsedMs = now - state.cycleStartTime;
    const tea = TeaFactory.create(state.teaType);
    const vessel = VesselFactory.create(state.vessel);

    const boilingPoint = Math.max(
      PHYSICS.MIN_BOILING_POINT,
      100.0 - (state.altitudeM / PHYSICS.ALTITUDE_BOILING_FACTOR),
    );
    const isActiveBoiling =
      state.currentTemp >= boilingPoint - PHYSICS.BOILING_POINT_CAP_OFFSET &&
      state.boilingInPot &&
      state.heatLevel > 0;

    // 1. Hydration & Unfurling
    const emptyContext: SimulationContext = {
      elapsedMs,
      isActiveBoiling,
      boilingPoint,
      surfaceFactor: 0,
      hydrationFactor: 0,
      lagPenalty: 1,
      turbulenceFactor: isActiveBoiling ? PHYSICS.TURBULENCE_FACTOR_BOIL : 1.0,
      vesselExtractionFactor: 1,
    };
    this.hydrationModel.step(state, dtMin, tea, vessel, emptyContext);
    this.unfurlingModel.step(state, dtMin, tea, vessel, emptyContext);

    const surfaceFactor =
      PHYSICS.SURFACE_FACTOR_MIN +
      (PHYSICS.SURFACE_FACTOR_MAX - PHYSICS.SURFACE_FACTOR_MIN) * state.unfurlingState;
    const hydrationFactor = Math.sqrt(state.hydrationState) * surfaceFactor;

    // 2. Thermodynamics
    const thermoContext: SimulationContext = {
      elapsedMs,
      isActiveBoiling,
      boilingPoint,
      surfaceFactor,
      hydrationFactor,
      lagPenalty: 1,
      turbulenceFactor: isActiveBoiling ? PHYSICS.TURBULENCE_FACTOR_BOIL : 1.0,
      vesselExtractionFactor: 1,
    };
    if (isActiveBoiling) {
      this.boilingModel.step(state, dtMin, tea, vessel, thermoContext);
      state.currentTemp = boilingPoint;
    } else {
      this.coolingModel.step(state, dtMin, tea, vessel, thermoContext);
    }

    // 3. Structural Integrity
    if (isActiveBoiling) {
      this.integrityModel.step(state, dtMin, tea, vessel, thermoContext);
    }

    // 4. Lag Penalty
    let lagPenalty = 1.0;
    if (elapsedMs < PHYSICS.LAG_DURATION_MS && !isActiveBoiling) {
      if (elapsedMs < PHYSICS.LAG_START_MS) {
        lagPenalty = 0.05;
      } else {
        lagPenalty =
          0.05 +
          0.95 *
            ((elapsedMs - PHYSICS.LAG_START_MS) /
              (PHYSICS.LAG_DURATION_MS - PHYSICS.LAG_START_MS));
      }
    }

    const vesselExtractionFactor =
      state.vessel === VesselType.GaiwanWhitePorcelain ||
      state.vessel === VesselType.GaiwanCeladon
        ? PHYSICS.VESSEL_FACTOR_GAIWAN
        : 1.0;

    const turbulenceFactor = isActiveBoiling
      ? PHYSICS.TURBULENCE_FACTOR_BOIL
      : 1.0;

    const context: SimulationContext = {
      elapsedMs,
      isActiveBoiling,
      boilingPoint,
      surfaceFactor,
      hydrationFactor,
      lagPenalty,
      turbulenceFactor,
      vesselExtractionFactor,
    };

    // 5. Component Extraction
    this.extractionModel.step(state, dtMin, tea, vessel, context);

    // 6. Aroma Dynamics
    this.aromaModel.step(state, dtMin, tea, vessel, context);

    // 7. Termination
    this.terminationModel.step(state, dtMin, tea, vessel, context);

    // 8. Distributor
    this.distributorModel.refresh(state, tea);

    state.lastUpdateTime = now;
  }

  backtrackCooling(tempOut: { value: number }, startTemp: number, durationMs: number): void {
    const tMin = durationMs / 60000.0;
    tempOut.value = startTemp * Math.exp(-PHYSICS.TEMP_COOL_BACKTRACK_K * tMin);
  }

  adjustTarget(state: TeaState, baseSlicePct: number): number {
    return this.distributorModel.adjustTarget(state, baseSlicePct);
  }
}
