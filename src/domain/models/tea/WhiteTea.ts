import { Tea } from './Tea';
import { TeaType } from '../../enums';
import type { TeaProfile, TeaCompProfile } from '../../types';
import { makeCompProfile } from './_shared';

/**
 * 백차 (白茶).
 */
export class WhiteTea extends Tea {
  get teaType(): TeaType { return TeaType.White; }

  getProfile(): TeaProfile {
    return { baseVelocity: 0.080, astringencyAcc: 0.001, leafDensity: 0.35 };
  }

  getCompProfile(): TeaCompProfile {
    return makeCompProfile({
      sCatechin: 140.0,
      sAminoAcid: 35.0,
      sAroma: 24.0,
      kCatechin: 0.50,
      sensCatechin: 1.8,
      sensAminoAcid: 0.6,
      kAroma: 0.65,
      aromaVolatilityBase: 0.20,
    });
  }

  getAromaPerceptionFloor(): number {
    return 0.36;
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
