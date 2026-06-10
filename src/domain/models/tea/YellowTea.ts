import { Tea } from './Tea';
import { TeaType } from '../../enums';
import type { TeaProfile, TeaCompProfile } from '../../types';
import { makeCompProfile } from './_shared';

/**
 * 황차 (黄茶).
 */
export class YellowTea extends Tea {
  get teaType(): TeaType { return TeaType.Yellow; }

  getProfile(): TeaProfile {
    return { baseVelocity: 0.100, astringencyAcc: 0.002, leafDensity: 0.48 };
  }

  getCompProfile(): TeaCompProfile {
    return makeCompProfile({
      sCatechin: 135.0,
      sAminoAcid: 28.0,
      sAroma: 20.0,
      kCatechin: 0.45,
      sensCatechin: 2.0,
      sensAminoAcid: 0.7,
      kAroma: 0.60,
    });
  }

  getAromaPerceptionFloor(): number {
    return 0.35;
  }
  getAromaBalanceTolerance(): number {
    return 0.04;
  }
  getAromaSignalFloor(): number {
    return 0.60;
  }
  getAromaBalanceMinTimeMs(): number {
    return 10000;
  }
}
