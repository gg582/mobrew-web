import { Tea } from './Tea';
import { TeaType } from '../../enums';
import type { TeaProfile, TeaCompProfile } from '../../types';
import { makeCompProfile } from './_shared';

/**
 * 우롱차 (烏龍茶).
 */
export class OolongTea extends Tea {
  get teaType(): TeaType { return TeaType.Oolong; }

  getProfile(): TeaProfile {
    return { baseVelocity: 0.110, astringencyAcc: 0.003, leafDensity: 0.60 };
  }

  getCompProfile(): TeaCompProfile {
    return makeCompProfile({});
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
