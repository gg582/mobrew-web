import { ThermodynamicModel } from './ThermodynamicModel';
import type { TeaState } from '@/engine/TeaState';
import type { BrewVessel } from '../vessel/BrewVessel';
import type { SimulationContext } from './SimulationContext';
import { PHYSICS } from '@/data/constants';

/**
 * 냉각 모델.
 * 비활성 상태에서의 온도 하강을 시뮬레이션합니다.
 */
export class CoolingModel extends ThermodynamicModel {
  get id(): string { return 'model_cooling'; }

  step(
    state: TeaState,
    dtMin: number,
    _tea: unknown,
    vessel: BrewVessel,
    _context: SimulationContext,
  ): void {
    const props = vessel.getProps();
    const tc = props.thermalConductivity;
    const sh = props.specificHeat;
    let kCool = PHYSICS.K_COOL_BASE * (tc / sh);
    if (state.hasButter) kCool *= 0.15;
    let newTemp = state.currentTemp * (1.0 - kCool * dtMin);
    if (newTemp < 20.0) newTemp = 20.0;
    state.currentTemp = newTemp;
  }
}
