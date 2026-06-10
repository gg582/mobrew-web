import { BrewVessel } from './BrewVessel';
import { VesselType } from '../../enums';
import type { VesselProps } from '../../types';

export class ZishaVessel extends BrewVessel {
  get vesselType(): VesselType {
    return VesselType.Zisha;
  }

  getProps(): VesselProps {
    return { specificHeat: 0.90, porosity: 0.20, thermalConductivity: 2.5 };
  }

  getOpenness(): number {
    return 1.10;
  }
}
