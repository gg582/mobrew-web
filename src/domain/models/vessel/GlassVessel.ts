import { BrewVessel } from './BrewVessel';
import { VesselType } from '../../enums';
import type { VesselProps } from '../../types';

export class GlassVessel extends BrewVessel {
  get vesselType(): VesselType {
    return VesselType.Glass;
  }

  getProps(): VesselProps {
    return { specificHeat: 0.75, porosity: 0.00, thermalConductivity: 0.9 };
  }

  getOpenness(): number {
    return 1.25;
  }
}
