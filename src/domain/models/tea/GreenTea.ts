import { Tea } from './Tea';
import { TeaType } from '../../enums';
import type { TeaProfile, TeaCompProfile } from '../../types';
import { makeCompProfile } from './_shared';

/**
 * 녹차 (一般緑茶).
 * Gyokuro, Sencha, Fukamushi의 상위 클래스.
 */
export class GreenTea extends Tea {
  get teaType(): TeaType { return TeaType.GreenNormal; }

  getProfile(): TeaProfile {
    return { baseVelocity: 0.120, astringencyAcc: 0.002, leafDensity: 0.45 };
  }

  getCompProfile(): TeaCompProfile {
    return makeCompProfile({
      sCatechin: 150.0,
      sAminoAcid: 30.0,
      sCaffeine: 30.0,
      sAroma: 22.0,
      kAminoAcid: 0.90,
      sensAminoAcid: 0.5,
      sensCatechin: 2.5,
      kAroma: 0.75,
      aromaVolatilityBase: 0.22,
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
