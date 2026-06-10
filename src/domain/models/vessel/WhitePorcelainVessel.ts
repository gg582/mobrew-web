import { BrewVessel } from './BrewVessel';
import { VesselType } from '../../enums';
import type { VesselProps } from '../../types';

export class WhitePorcelainVessel extends BrewVessel {
  get vesselType(): VesselType {
    return VesselType.WhitePorcelain;
  }

  getProps(): VesselProps {
    return { specificHeat: 0.80, porosity: 0.01, thermalConductivity: 1.5 };
  }

  getOpenness(): number {
    return 1.0;
  }
}
