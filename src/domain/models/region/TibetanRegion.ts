import { BrewingRegion } from './BrewingRegion';
import { BrewingRegion as BrewingRegionEnum, TeaType, VesselType, BoilMethod } from '../../enums';
import type { RegionPreset } from '../../types';

export class TibetanRegion extends BrewingRegion {
  get regionType(): BrewingRegionEnum {
    return BrewingRegionEnum.Tibetan;
  }

  getPreset(): RegionPreset {
    return {
      name: 'Himalayan / Tibetan',
      emoji: '🏔️',
      description: 'High-altitude butter tea and aged pu-erh boiling',
      defaultTeaType: TeaType.Tibetan,
      defaultVessel: VesselType.JapaneseCeramics,
      defaultTemp: 100,
      defaultLeafMass: 10,
      defaultWaterVolume: 300,
      defaultNumInfusions: 3,
      defaultTds: 150,
      defaultAltitude: 3500,
      defaultLeafWidth: 10,
      defaultLeafHeight: 30,
      defaultBoilMethod: BoilMethod.PotIron,
      easyModeTeas: [TeaType.Tibetan, TeaType.Puerh, TeaType.Black],
      themeColor: '#fb923c',
    };
  }
}
