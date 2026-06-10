import { BrewVessel } from './BrewVessel';
import { VesselType } from '../../enums';
import type { VesselProps } from '../../types';

export class BritishTeapotVessel extends BrewVessel {
  get vesselType(): VesselType {
    return VesselType.BritishTeapot;
  }

  getProps(): VesselProps {
    return { specificHeat: 0.84, porosity: 0.05, thermalConductivity: 1.1 };
  }

  getOpenness(): number {
    return 1.25;
  }
}
