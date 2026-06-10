import { VesselType } from '../enums';
import type { BrewVessel } from '../models/vessel/BrewVessel';
import { BritishTeapotVessel } from '../models/vessel/BritishTeapotVessel';
import { ZishaVessel } from '../models/vessel/ZishaVessel';
import { WhitePorcelainVessel } from '../models/vessel/WhitePorcelainVessel';
import { CeladonVessel } from '../models/vessel/CeladonVessel';
import { JapaneseCeramicsVessel } from '../models/vessel/JapaneseCeramicsVessel';
import { GlassVessel } from '../models/vessel/GlassVessel';
import { GaiwanWhitePorcelainVessel } from '../models/vessel/GaiwanWhitePorcelainVessel';
import { GaiwanCeladonVessel } from '../models/vessel/GaiwanCeladonVessel';

/**
 * BrewVessel 객체 팩토리.
 */
export class VesselFactory {
  private static readonly cache = new Map<VesselType, BrewVessel>();

  static create(vesselType: VesselType): BrewVessel {
    const cached = this.cache.get(vesselType);
    if (cached) return cached;

    const vessel = this.instantiate(vesselType);
    this.cache.set(vesselType, vessel);
    return vessel;
  }

  private static instantiate(vesselType: VesselType): BrewVessel {
    switch (vesselType) {
      case VesselType.BritishTeapot:
        return new BritishTeapotVessel();
      case VesselType.Zisha:
        return new ZishaVessel();
      case VesselType.WhitePorcelain:
        return new WhitePorcelainVessel();
      case VesselType.Celadon:
        return new CeladonVessel();
      case VesselType.JapaneseCeramics:
        return new JapaneseCeramicsVessel();
      case VesselType.Glass:
        return new GlassVessel();
      case VesselType.GaiwanWhitePorcelain:
        return new GaiwanWhitePorcelainVessel();
      case VesselType.GaiwanCeladon:
        return new GaiwanCeladonVessel();
      default:
        throw new Error(`Unknown vessel type: ${vesselType}`);
    }
  }
}
