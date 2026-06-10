import { BrewVessel } from './BrewVessel';
import { VesselType } from '../../enums';
import type { VesselProps } from '../../types';

export class CeladonVessel extends BrewVessel {
  get vesselType(): VesselType {
    return VesselType.Celadon;
  }

  getProps(): VesselProps {
    return { specificHeat: 0.82, porosity: 0.02, thermalConductivity: 1.6 };
  }

  getOpenness(): number {
    return 1.0;
  }
}
