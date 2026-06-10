import { TeaType, VesselType, BoilMethod, UnitSystem, HardnessUnit } from '@/domain/enums';
import { TeaLeaf } from '@/domain/models/TeaLeaf';
import type { TeaStateData } from '@/domain/types';

export class TeaState implements TeaStateData {
  startTime = 0;
  currentTemp = 0;
  extractionLevel = 0;

  extCatechin = 0;
  extAminoAcid = 0;
  extCaffeine = 0;
  extPectin = 0;
  extPolysaccharide = 0;
  extLignin = 0;
  extAroma = 0;

  accumExtCatechin = 0;
  accumExtAminoAcid = 0;
  accumExtCaffeine = 0;
  accumExtPectin = 0;
  accumExtPolysaccharide = 0;
  accumExtLignin = 0;
  accumExtAroma = 0;

  structuralIntegrity = 1.0;
  hydrationState = 0;
  unfurlingState = 0;
  leafDensity = 0;
  astringencyRate = 0;
  sweetnessRate = 0;
  saturationIndex = 0;
  stopSignal = false;
  aromaExtractionAxis = 0;
  aromaVolatilityAxis = 0;
  aminoDepthAxis = 0;
  aminoVibrancyAxis = 0;
  clarityIndex = 0;

  unitSystem = UnitSystem.Metric;
  useFahrenheit = false;
  hardnessUnit = HardnessUnit.TdsPpm;

  extVelocity = 0;
  bitterAccel = 0;

  distributorPotential = 0;
  distributorDragRatio = 1.0;
  distributorTargetHint = 0;

  teaType = TeaType.GreenNormal;
  vessel = VesselType.BritishTeapot;
  boilMethod = BoilMethod.Electric;
  waterHardness = 0;
  leafWidth = 0;
  leafHeight = 0;
  leafMass = 0;
  waterVolumeMl = 0;
  altitudeM = 0;
  vintageYears = 0;
  isRipe = false;
  hasButter = false;
  boilingInPot = false;
  heatLevel = 0;

  isBottled = false;
  mineralContent = [0, 0, 0, 0, 0];
  tds = 0;
  isLimestoneBedrock = false;

  numInfusions = 1;
  currentInfusion = 0;
  cycleStartTime = 0;
  targetExtractionForCycle = 0;
  cycleStartExtraction = 0;
  cycleActive = false;

  lastUpdateTime = 0;
  tempPreserved = false;
  isExhausted = false;

  /** 차 잎 엔티티 (구성) */
  teaLeaf = new TeaLeaf();

  static createDefault(): TeaState {
    return new TeaState();
  }

  resetCycle(): void {
    this.extCatechin = 0;
    this.extAminoAcid = 0;
    this.extCaffeine = 0;
    this.extPectin = 0;
    this.extPolysaccharide = 0;
    this.extLignin = 0;
    this.extAroma = 0;
    this.astringencyRate = 0;
    this.sweetnessRate = 0;
    this.extVelocity = 0;
    this.bitterAccel = 0;
    this.aromaExtractionAxis = 0;
    this.aromaVolatilityAxis = 0;
    this.aminoDepthAxis = 0;
    this.aminoVibrancyAxis = 0;
    this.stopSignal = false;
    this.cycleActive = true;
    this.cycleStartTime = performance.now();
    this.lastUpdateTime = this.cycleStartTime;
    this.cycleStartExtraction = this.extractionLevel;
  }

  accumulate(): void {
    this.accumExtCatechin += this.extCatechin;
    this.accumExtAminoAcid += this.extAminoAcid;
    this.accumExtCaffeine += this.extCaffeine;
    this.accumExtPectin += this.extPectin;
    this.accumExtPolysaccharide += this.extPolysaccharide;
    this.accumExtLignin += this.extLignin;
    this.accumExtAroma += this.extAroma;
  }

  clone(): TeaState {
    const s = new TeaState();
    Object.assign(s, this);
    s.mineralContent = [...this.mineralContent];
    return s;
  }
}
