import { VesselType } from '@/domain/enums';
import type { VesselProps } from '@/domain/types';

// Data-oriented: pure lookup tables
export const VESSEL_PROPS_TABLE: Record<VesselType, VesselProps> = {
  [VesselType.BritishTeapot]:       { specificHeat: 0.84, porosity: 0.05, thermalConductivity: 1.1 },
  [VesselType.Zisha]:               { specificHeat: 0.90, porosity: 0.20, thermalConductivity: 2.5 },
  [VesselType.WhitePorcelain]:      { specificHeat: 0.80, porosity: 0.01, thermalConductivity: 1.5 },
  [VesselType.Celadon]:             { specificHeat: 0.82, porosity: 0.02, thermalConductivity: 1.6 },
  [VesselType.JapaneseCeramics]:    { specificHeat: 0.85, porosity: 0.10, thermalConductivity: 1.8 },
  [VesselType.Glass]:               { specificHeat: 0.75, porosity: 0.00, thermalConductivity: 0.9 },
  [VesselType.GaiwanWhitePorcelain]:{ specificHeat: 0.78, porosity: 0.01, thermalConductivity: 1.7 },
  [VesselType.GaiwanCeladon]:       { specificHeat: 0.80, porosity: 0.02, thermalConductivity: 1.8 },
};

export const VESSEL_OPENNESS: Record<VesselType, number> = {
  [VesselType.BritishTeapot]:       1.25,
  [VesselType.Zisha]:               1.10,
  [VesselType.WhitePorcelain]:      1.0,
  [VesselType.Celadon]:             1.0,
  [VesselType.JapaneseCeramics]:    1.0,
  [VesselType.Glass]:               1.25,
  [VesselType.GaiwanWhitePorcelain]:1.35,
  [VesselType.GaiwanCeladon]:       1.35,
};
