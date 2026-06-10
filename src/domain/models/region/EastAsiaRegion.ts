import { BrewingRegion } from './BrewingRegion';
import { BrewingRegion as BrewingRegionEnum, TeaType, VesselType, BoilMethod } from '../../enums';
import type { RegionPreset } from '../../types';

export class EastAsiaRegion extends BrewingRegion {
  get regionType(): BrewingRegionEnum {
    return BrewingRegionEnum.EastAsia;
  }

  getPreset(): RegionPreset {
    return {
      name: 'East Asia',
      emoji: '🍵',
      description: 'China, Japan, Korea — Gongfu style with precision vessels',
      defaultTeaType: TeaType.GreenSencha,
      defaultVessel: VesselType.GaiwanWhitePorcelain,
      defaultTemp: 75,
      defaultLeafMass: 5,
      defaultWaterVolume: 120,
      defaultNumInfusions: 5,
      defaultTds: 80,
      defaultAltitude: 0,
      defaultLeafWidth: 6,
      defaultLeafHeight: 18,
      defaultBoilMethod: BoilMethod.Electric,
      easyModeTeas: [
        TeaType.GreenSencha, TeaType.GreenGyokuro, TeaType.GreenFukamushi,
        TeaType.Oolong, TeaType.White, TeaType.Yellow, TeaType.Puerh,
      ],
      themeColor: '#4ade80',
    };
  }
}
