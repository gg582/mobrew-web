import { TeaType, VesselType, BoilMethod, UnitSystem, HardnessUnit } from './enums';

export interface VesselProps {
  specificHeat: number;
  porosity: number;
  thermalConductivity: number;
}

export interface TeaProfile {
  baseVelocity: number;
  astringencyAcc: number;
  leafDensity: number;
}

export interface TeaCompProfile {
  sCatechin: number;
  sAminoAcid: number;
  sCaffeine: number;
  sPectin: number;
  sPolysaccharide: number;
  sAroma: number;

  kCatechin: number;
  kAminoAcid: number;
  kCaffeine: number;
  kPectin: number;
  kPolysaccharide: number;
  kAroma: number;

  sensCatechin: number;
  sensAminoAcid: number;
  sensCaffeine: number;
  sensPectin: number;
  sensPolysaccharide: number;
  sensAroma: number;

  aromaVolatilityBase: number;
}

export interface TeaStateData {
  startTime: number;
  currentTemp: number;
  extractionLevel: number;

  extCatechin: number;
  extAminoAcid: number;
  extCaffeine: number;
  extPectin: number;
  extPolysaccharide: number;
  extLignin: number;
  extAroma: number;

  accumExtCatechin: number;
  accumExtAminoAcid: number;
  accumExtCaffeine: number;
  accumExtPectin: number;
  accumExtPolysaccharide: number;
  accumExtLignin: number;
  accumExtAroma: number;

  structuralIntegrity: number;
  hydrationState: number;
  unfurlingState: number;
  leafDensity: number;
  astringencyRate: number;
  sweetnessRate: number;
  saturationIndex: number;
  stopSignal: boolean;
  aromaExtractionAxis: number;
  aromaVolatilityAxis: number;
  aminoDepthAxis: number;
  aminoVibrancyAxis: number;
  clarityIndex: number;

  unitSystem: UnitSystem;
  useFahrenheit: boolean;
  hardnessUnit: HardnessUnit;

  extVelocity: number;
  bitterAccel: number;

  distributorPotential: number;
  distributorDragRatio: number;
  distributorTargetHint: number;

  teaType: TeaType;
  vessel: VesselType;
  boilMethod: BoilMethod;
  waterHardness: number;
  leafWidth: number;
  leafHeight: number;
  leafMass: number;
  waterVolumeMl: number;
  altitudeM: number;
  vintageYears: number;
  isRipe: boolean;
  hasButter: boolean;
  boilingInPot: boolean;
  heatLevel: number;

  isBottled: boolean;
  mineralContent: number[];
  tds: number;
  isLimestoneBedrock: boolean;

  numInfusions: number;
  currentInfusion: number;
  cycleStartTime: number;
  targetExtractionForCycle: number;
  cycleStartExtraction: number;
  cycleActive: boolean;

  lastUpdateTime: number;
  tempPreserved: boolean;
  isExhausted: boolean;
}

export interface RegionPreset {
  name: string;
  emoji: string;
  description: string;
  defaultTeaType: TeaType;
  defaultVessel: VesselType;
  defaultTemp: number;
  defaultLeafMass: number;
  defaultWaterVolume: number;
  defaultNumInfusions: number;
  defaultTds: number;
  defaultAltitude: number;
  defaultLeafWidth: number;
  defaultLeafHeight: number;
  defaultBoilMethod: BoilMethod;
  easyModeTeas: TeaType[];
  themeColor: string;
}

// Re-export class-based SimulationSnapshot (replaces former interface)
export { SimulationSnapshot, ExtractionComponents } from './models/SimulationSnapshot';
export { SimulationSnapshotBuilder } from './models/SimulationSnapshotBuilder';
export { RecommendationResult, RecommendationResultBuilder } from './models/RecommendationResult';
export { Temperature } from './models/Temperature';
export { Volume } from './models/Volume';
export { Mass } from './models/Mass';
export { Percentage } from './models/Percentage';
export { ElapsedTime } from './models/ElapsedTime';
export { TeaLeaf } from './models/TeaLeaf';
export { Tea } from './models/tea/Tea';
export { TeaFactory } from './factories/TeaFactory';
export { VesselFactory } from './factories/VesselFactory';
export { RegionFactory } from './factories/RegionFactory';
