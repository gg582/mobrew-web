import { BrewVessel } from './BrewVessel';
import { VesselType } from '../../enums';
import type { VesselProps } from '../../types';

export class GaiwanCeladonVessel extends BrewVessel {
  get vesselType(): VesselType {
    return VesselType.GaiwanCeladon;
  }

  getProps(): VesselProps {
    return { specificHeat: 0.80, porosity: 0.02, thermalConductivity: 1.8 };
  }

  getOpenness(): number {
    return 1.35;
  }
}
