import { BrewingRegion as BrewingRegionEnum } from '../enums';
import type { BrewingRegion } from '../models/region/BrewingRegion';
import { EastAsiaRegion } from '../models/region/EastAsiaRegion';
import { BritishRegion } from '../models/region/BritishRegion';
import { SoutheastAsiaRegion } from '../models/region/SoutheastAsiaRegion';
import { TibetanRegion } from '../models/region/TibetanRegion';
import { WesternModernRegion } from '../models/region/WesternModernRegion';

/**
 * BrewingRegion 객체 팩토리.
 */
export class RegionFactory {
  private static readonly cache = new Map<BrewingRegionEnum, BrewingRegion>();

  static create(regionType: BrewingRegionEnum): BrewingRegion {
    const cached = this.cache.get(regionType);
    if (cached) return cached;

    const region = this.instantiate(regionType);
    this.cache.set(regionType, region);
    return region;
  }

  private static instantiate(regionType: BrewingRegionEnum): BrewingRegion {
    switch (regionType) {
      case BrewingRegionEnum.EastAsia:
        return new EastAsiaRegion();
      case BrewingRegionEnum.British:
        return new BritishRegion();
      case BrewingRegionEnum.SoutheastAsia:
        return new SoutheastAsiaRegion();
      case BrewingRegionEnum.Tibetan:
        return new TibetanRegion();
      case BrewingRegionEnum.WesternModern:
        return new WesternModernRegion();
      default:
        throw new Error(`Unknown region: ${regionType}`);
    }
  }
}
