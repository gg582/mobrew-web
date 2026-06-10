import { DomainObject } from '../base/DomainObject';
import type { VesselType } from '../../enums';
import type { VesselProps } from '../../types';

/**
 * 추출 다구(茶器)의 추상 기반 클래스.
 */
export abstract class BrewVessel extends DomainObject {
  abstract get vesselType(): VesselType;

  /** 다구의 열역학 특성 */
  abstract getProps(): VesselProps;

  /** 다구의 개방도 (아로마 발산에 영향) */
  abstract getOpenness(): number;

  get id(): string {
    return `vessel_${this.vesselType}`;
  }
}
