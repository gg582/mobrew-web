import { ThermodynamicModel } from './ThermodynamicModel';
import type { TeaState } from '@/engine/TeaState';
import type { BrewVessel } from '../vessel/BrewVessel';
import type { SimulationContext } from './SimulationContext';
import { PHYSICS } from '@/data/constants';

/**
 * 끓임 모델.
 * 활성 끓임 상태에서의 온도 유지와 증발을 시뮬레이션합니다.
 */
export class BoilingModel extends ThermodynamicModel {
  get id(): string { return 'model_boiling'; }

  step(
    state: TeaState,
    dtMin: number,
    _tea: unknown,
    _vessel: BrewVessel,
    _context: SimulationContext,
  ): void {
    const evapRate = PHYSICS.EVAP_RATE_PER_HEAT * state.heatLevel;
    const volLost = evapRate * dtMin;
    if (state.waterVolumeMl > volLost) {
      state.waterVolumeMl -= volLost;
    }
  }
}
