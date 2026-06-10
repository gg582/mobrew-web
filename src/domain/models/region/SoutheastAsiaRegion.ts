import { BrewingRegion } from './BrewingRegion';
import { BrewingRegion as BrewingRegionEnum, TeaType, VesselType, BoilMethod } from '../../enums';
import type { RegionPreset } from '../../types';

export class SoutheastAsiaRegion extends BrewingRegion {
  get regionType(): BrewingRegionEnum {
    return BrewingRegionEnum.SoutheastAsia;
  }

  getPreset(): RegionPreset {
    return {
      name: 'Southeast Asia',
      emoji: '🌿',
      description: 'Oolong & Pu-erh with gongfu ceremony focus',
      defaultTeaType: TeaType.Oolong,
      defaultVessel: VesselType.Zisha,
      defaultTemp: 90,
      defaultLeafMass: 7,
      defaultWaterVolume: 100,
      defaultNumInfusions: 7,
      defaultTds: 120,
      defaultAltitude: 200,
      defaultLeafWidth: 8,
      defaultLeafHeight: 25,
      defaultBoilMethod: BoilMethod.PotClay,
      easyModeTeas: [TeaType.Oolong, TeaType.Puerh, TeaType.GreenNormal],
      themeColor: '#fbbf24',
    };
  }
}
