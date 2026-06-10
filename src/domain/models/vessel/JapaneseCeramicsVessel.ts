import { BrewVessel } from './BrewVessel';
import { VesselType } from '../../enums';
import type { VesselProps } from '../../types';

export class JapaneseCeramicsVessel extends BrewVessel {
  get vesselType(): VesselType {
    return VesselType.JapaneseCeramics;
  }

  getProps(): VesselProps {
    return { specificHeat: 0.85, porosity: 0.10, thermalConductivity: 1.8 };
  }

  getOpenness(): number {
    return 1.0;
  }
}
