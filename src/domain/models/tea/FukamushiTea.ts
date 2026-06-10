import { GreenTea } from './GreenTea';
import { TeaType } from '../../enums';
import type { TeaProfile, TeaCompProfile } from '../../types';
import { makeCompProfile } from './_shared';

/**
 * 후침무시 센차 (深蒸し煎茶). GreenTea를 확장합니다.
 */
export class FukamushiTea extends GreenTea {
  get teaType(): TeaType { return TeaType.GreenFukamushi; }

  getProfile(): TeaProfile {
    return { baseVelocity: 0.170, astringencyAcc: 0.004, leafDensity: 0.38 };
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
