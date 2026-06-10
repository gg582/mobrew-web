import { Tea } from './Tea';
import { TeaType } from '../../enums';
import type { TeaProfile, TeaCompProfile } from '../../types';
import { makeCompProfile } from './_shared';

/**
 * 보이차 (普洱茶).
 */
export class PuerhTea extends Tea {
  get teaType(): TeaType { return TeaType.Puerh; }

  getProfile(): TeaProfile {
    return { baseVelocity: 0.180, astringencyAcc: 0.001, leafDensity: 0.70 };
  }

  getCompProfile(): TeaCompProfile {
    return makeCompProfile({
      sCatechin: 90.0,
      sPolysaccharide: 40.0,
      kPolysaccharide: 0.45,
      sAroma: 12.0,
      kAroma: 0.35,
      aromaVolatilityBase: 0.42,
    });
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
    return 25000;
  }
}
