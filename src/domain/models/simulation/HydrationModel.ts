import { SimulationModel } from './SimulationModel';
import type { TeaState } from '@/engine/TeaState';
import type { Tea } from '../tea/Tea';
import type { BrewVessel } from '../vessel/BrewVessel';
import type { SimulationContext } from './SimulationContext';
import { PHYSICS } from '@/data/constants';
import { TeaType } from '@/domain/enums';

/**
 * 수분 흡수(Hydration) 모델.
 * 잎이 물을 흡수하는 과정을 시뮬레이션합니다.
 */
export class HydrationModel extends SimulationModel {
  get id(): string { return 'model_hydration'; }

  step(
    state: TeaState,
    dtMin: number,
    tea: Tea,
    _vessel: BrewVessel,
    _context: SimulationContext,
  ): void {
    const temp = state.currentTemp;
    let density = state.leafDensity || tea.getProfile().leafDensity;

    let kHyd: number = PHYSICS.K_HYD_BASE;
    let tempFactorHyd = 1.0;

    switch (state.teaType) {
      case TeaType.GreenNormal:
      case TeaType.GreenSencha:
      case TeaType.GreenFukamushi:
      case TeaType.Yellow:
      case TeaType.White:
      case TeaType.GreenGyokuro:
        kHyd = 1.2;
        tempFactorHyd = Math.exp((temp - 100.0) / 45.0) + PHYSICS.BASE_HYDRATION_FLOOR;
        break;
      case TeaType.Oolong:
      case TeaType.Black:
        kHyd = 0.6;
        tempFactorHyd = Math.exp((temp - 100.0) / 20.0);
        break;
      case TeaType.Puerh:
      case TeaType.Tibetan:
        kHyd = 0.3;
        tempFactorHyd = Math.exp((temp - 100.0) / 15.0);
        break;
    }

    const dhDt = kHyd * (1.0 - state.hydrationState) * tempFactorHyd / density;
    state.hydrationState = Math.min(1.0, state.hydrationState + dhDt * dtMin);
  }
}
