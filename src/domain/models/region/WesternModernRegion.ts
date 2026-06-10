import { BrewingRegion } from './BrewingRegion';
import { BrewingRegion as BrewingRegionEnum, TeaType, VesselType, BoilMethod } from '../../enums';
import type { RegionPreset } from '../../types';

export class WesternModernRegion extends BrewingRegion {
  get regionType(): BrewingRegionEnum {
    return BrewingRegionEnum.WesternModern;
  }

  getPreset(): RegionPreset {
    return {
      name: 'Western / Modern',
      emoji: '🫖',
      description: 'Versatile glass and porcelain brewing for any tea',
      defaultTeaType: TeaType.GreenNormal,
      defaultVessel: VesselType.Glass,
      defaultTemp: 85,
      defaultLeafMass: 4,
      defaultWaterVolume: 200,
      defaultNumInfusions: 3,
      defaultTds: 100,
      defaultAltitude: 100,
      defaultLeafWidth: 5,
      defaultLeafHeight: 15,
      defaultBoilMethod: BoilMethod.Electric,
      easyModeTeas: [
        TeaType.GreenNormal, TeaType.White, TeaType.Black,
        TeaType.Oolong, TeaType.Yellow, TeaType.Puerh,
      ],
      themeColor: '#60a5fa',
    };
  }
}
