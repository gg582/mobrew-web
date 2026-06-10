import { DomainObject } from '../base/DomainObject';
import type { BrewingRegion as BrewingRegionEnum } from '../../enums';
import type { RegionPreset } from '../../types';

/**
 * 추출 지역의 추상 기반 클래스.
 */
export abstract class BrewingRegion extends DomainObject {
  abstract get regionType(): BrewingRegionEnum;

  abstract getPreset(): RegionPreset;

  get id(): string {
    return `region_${this.regionType}`;
  }
}
