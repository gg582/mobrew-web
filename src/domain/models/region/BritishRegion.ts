import { BrewingRegion } from './BrewingRegion';
import { BrewingRegion as BrewingRegionEnum, TeaType, VesselType, BoilMethod } from '../../enums';
import type { RegionPreset } from '../../types';

export class BritishRegion extends BrewingRegion {
  get regionType(): BrewingRegionEnum {
    return BrewingRegionEnum.British;
  }

  getPreset(): RegionPreset {
    return {
      name: 'British Isles',
      emoji: '☕',
      description: 'Full-bodied black tea in a classic teapot',
      defaultTeaType: TeaType.Black,
      defaultVessel: VesselType.BritishTeapot,
      defaultTemp: 95,
      defaultLeafMass: 3,
      defaultWaterVolume: 240,
      defaultNumInfusions: 1,
      defaultTds: 250,
      defaultAltitude: 50,
      defaultLeafWidth: 4,
      defaultLeafHeight: 12,
      defaultBoilMethod: BoilMethod.Electric,
      easyModeTeas: [TeaType.Black, TeaType.White],
      themeColor: '#f87171',
    };
  }
}
