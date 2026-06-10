import { Tea } from './Tea';
import { TeaType } from '../../enums';
import type { TeaProfile, TeaCompProfile } from '../../types';
import { makeCompProfile } from './_shared';

/**
 * 홍차 (紅茶).
 */
export class BlackTea extends Tea {
  get teaType(): TeaType { return TeaType.Black; }

  getProfile(): TeaProfile {
    return { baseVelocity: 0.160, astringencyAcc: 0.005, leafDensity: 0.55 };
  }

  getCompProfile(): TeaCompProfile {
    return makeCompProfile({
      sCatechin: 100.0,
      sAminoAcid: 10.0,
      sCaffeine: 45.0,
      sAroma: 16.0,
      kCatechin: 0.60,
      kCaffeine: 0.60,
      kAroma: 0.50,
      aromaVolatilityBase: 0.38,
    });
  }

  getAromaPerceptionFloor(): number {
    return 0.40;
  }
  getAromaBalanceTolerance(): number {
    return 0.05;
  }
  getAromaSignalFloor(): number {
    return 0.70;
  }
  getAromaBalanceMinTimeMs(): number {
    return 14000;
  }
}
