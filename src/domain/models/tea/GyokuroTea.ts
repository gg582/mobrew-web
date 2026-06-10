import { GreenTea } from './GreenTea';
import { TeaType } from '../../enums';
import type { TeaProfile, TeaCompProfile } from '../../types';
import { makeCompProfile } from './_shared';

/**
 * 교쿠로 (玉露). GreenTea를 확장합니다.
 */
export class GyokuroTea extends GreenTea {
  get teaType(): TeaType { return TeaType.GreenGyokuro; }

  getProfile(): TeaProfile {
    return { baseVelocity: 0.140, astringencyAcc: 0.004, leafDensity: 0.40 };
  }

  getCompProfile(): TeaCompProfile {
    return makeCompProfile({
      sCatechin: 130.0,
      sAminoAcid: 60.0,
      kAminoAcid: 1.20,
      sensAminoAcid: 0.3,
      sensCatechin: 3.5,
      sAroma: 28.0,
      kAroma: 0.90,
      aromaVolatilityBase: 0.18,
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
