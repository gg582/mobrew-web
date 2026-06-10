import { SimulationModel } from './SimulationModel';
import type { TeaState } from '@/engine/TeaState';
import type { BrewVessel } from '../vessel/BrewVessel';
import type { SimulationContext } from './SimulationContext';
import { PHYSICS } from '@/data/constants';

/**
 * 구조적 파괴 모델.
 * 끓임 중 잎의 구조적 파괴를 시뮬레이션합니다.
 */
export class StructuralIntegrityModel extends SimulationModel {
  get id(): string { return 'model_integrity'; }

  step(
    state: TeaState,
    dtMin: number,
    _tea: unknown,
    _vessel: BrewVessel,
    _context: SimulationContext,
  ): void {
    state.structuralIntegrity = Math.max(0.0, state.structuralIntegrity - PHYSICS.K_RUPTURE * dtMin);
  }
}
