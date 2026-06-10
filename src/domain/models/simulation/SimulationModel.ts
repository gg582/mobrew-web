import { DomainObject } from '../base/DomainObject';
import type { TeaState } from '@/engine/TeaState';
import type { Tea } from '../tea/Tea';
import type { BrewVessel } from '../vessel/BrewVessel';
import type { SimulationContext } from './SimulationContext';

/**
 * 시뮬레이션 모델의 추상 기반 클래스.
 * PhysicsEngine이 여러 모델을 구성으로 포함하여 오케스트레이션합니다.
 */
export abstract class SimulationModel extends DomainObject {
  /**
   * 한 시뮬레이션 스텝을 실행합니다.
   * @param state 현재 차 상태 (직접 변형됨)
   * @param dtMin 경과 시간 (분)
   * @param tea 현재 차 객체
   * @param vessel 현재 다구 객체
   * @param context 공유 시뮬레이션 컨텍스트
   */
  abstract step(
    state: TeaState,
    dtMin: number,
    tea: Tea,
    vessel: BrewVessel,
    context: SimulationContext,
  ): void;
}
