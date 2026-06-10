import { Tea } from './Tea';
import { TeaType } from '../../enums';
import type { TeaProfile, TeaCompProfile } from '../../types';
import { makeCompProfile } from './_shared';

/**
 * 티베트 발효차.
 */
export class TibetanTea extends Tea {
  get teaType(): TeaType { return TeaType.Tibetan; }

  getProfile(): TeaProfile {
    return { baseVelocity: 0.060, astringencyAcc: 0.000, leafDensity: 0.80 };
  }

  getCompProfile(): TeaCompProfile {
    return makeCompProfile({});
  }

  getAromaPerceptionFloor(): number {
    return 0.30;
  }
  getAromaBalanceTolerance(): number {
    return 0.08;
  }
  getAromaSignalFloor(): number {
    return 0.45;
  }
  getAromaBalanceMinTimeMs(): number {
    return 30000;
  }
}
