import { DomainObject } from '../base/DomainObject';
import type { TeaType } from '../../enums';
import type { TeaProfile, TeaCompProfile } from '../../types';

/**
 * 차(茶)의 추상 기반 클래스.
 * 모든 차 종류는 이 클래스를 확장하여 자신의 물리적 특성을 정의합니다.
 */
export abstract class Tea extends DomainObject {
  /** 차 종류 식별자 */
  abstract get teaType(): TeaType;

  /** 차의 기본 프로필 (추출 속도, 밀도 등) */
  abstract getProfile(): TeaProfile;

  /** 차의 성분 프로필 (용해량, 감도 등) */
  abstract getCompProfile(): TeaCompProfile;

  /** 아로마 감지 하한선 */
  abstract getAromaPerceptionFloor(): number;

  /** 아로마 균형 허용 오차 */
  abstract getAromaBalanceTolerance(): number;

  /** 아로마 신호 하한선 */
  abstract getAromaSignalFloor(): number;

  /** 아로마 균형 최소 시간 (ms) */
  abstract getAromaBalanceMinTimeMs(): number;

  get id(): string {
    return `tea_${this.teaType}`;
  }
}
