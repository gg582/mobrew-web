import { SimulationModel } from './SimulationModel';
import type { TeaState } from '@/engine/TeaState';
import type { BrewVessel } from '../vessel/BrewVessel';
import type { SimulationContext } from './SimulationContext';
import { PHYSICS } from '@/data/constants';
import { TeaType } from '@/domain/enums';

/**
 * 잎 전개(Unfurling) 모델.
 * 잎이 펼쳐지며 표면적이 증가하는 과정을 시뮬레이션합니다.
 */
export class UnfurlingModel extends SimulationModel {
  get id(): string { return 'model_unfurling'; }

  step(
    state: TeaState,
    dtMin: number,
    _tea: unknown,
    _vessel: BrewVessel,
    _context: SimulationContext,
  ): void {
    let kUnfurl = PHYSICS.K_UNFURL_BASE as number;

    switch (state.teaType) {
      case TeaType.GreenNormal:
      case TeaType.GreenSencha:
      case TeaType.GreenFukamushi:
      case TeaType.Yellow:
      case TeaType.White:
      case TeaType.GreenGyokuro:
        kUnfurl = 2.0;
        break;
      case TeaType.Oolong:
      case TeaType.Black:
        kUnfurl = 0.8;
        break;
      case TeaType.Puerh:
      case TeaType.Tibetan:
        kUnfurl = 0.4;
        break;
    }

    let duDt = kUnfurl * (state.hydrationState - state.unfurlingState) * (state.currentTemp / 100.0);
    if (state.unfurlingState > PHYSICS.UNFURL_AVALANCHE_THRESHOLD) {
      duDt *= PHYSICS.UNFURL_AVALANCHE;
    }
    state.unfurlingState = Math.min(1.0, state.unfurlingState + duDt * dtMin);
  }
}
