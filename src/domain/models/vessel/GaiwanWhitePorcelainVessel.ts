import { BrewVessel } from './BrewVessel';
import { VesselType } from '../../enums';
import type { VesselProps } from '../../types';

export class GaiwanWhitePorcelainVessel extends BrewVessel {
  get vesselType(): VesselType {
    return VesselType.GaiwanWhitePorcelain;
  }

  getProps(): VesselProps {
    return { specificHeat: 0.78, porosity: 0.01, thermalConductivity: 1.7 };
  }

  getOpenness(): number {
    return 1.35;
  }
}
