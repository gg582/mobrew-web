import { TeaType } from '@/domain/enums';
import type { TeaProfile, TeaCompProfile } from '@/domain/types';

// Data-Oriented Design: flat tables for tea profiles

export const TEA_PROFILE_TABLE: Record<TeaType, TeaProfile> = {
  [TeaType.GreenNormal]:    { baseVelocity: 0.120, astringencyAcc: 0.002, leafDensity: 0.45 },
  [TeaType.White]:          { baseVelocity: 0.080, astringencyAcc: 0.001, leafDensity: 0.35 },
  [TeaType.Black]:          { baseVelocity: 0.160, astringencyAcc: 0.005, leafDensity: 0.55 },
  [TeaType.Oolong]:         { baseVelocity: 0.110, astringencyAcc: 0.003, leafDensity: 0.60 },
  [TeaType.Yellow]:         { baseVelocity: 0.100, astringencyAcc: 0.002, leafDensity: 0.48 },
  [TeaType.Puerh]:          { baseVelocity: 0.180, astringencyAcc: 0.001, leafDensity: 0.70 },
  [TeaType.GreenGyokuro]:   { baseVelocity: 0.140, astringencyAcc: 0.004, leafDensity: 0.40 },
  [TeaType.GreenSencha]:    { baseVelocity: 0.130, astringencyAcc: 0.003, leafDensity: 0.42 },
  [TeaType.GreenFukamushi]: { baseVelocity: 0.170, astringencyAcc: 0.004, leafDensity: 0.38 },
  [TeaType.Tibetan]:        { baseVelocity: 0.060, astringencyAcc: 0.000, leafDensity: 0.80 },
};

const BASE_COMP: TeaCompProfile = {
  sCatechin: 120.0, sAminoAcid: 20.0, sCaffeine: 35.0, sPectin: 18.0, sPolysaccharide: 22.0, sAroma: 18.0,
  kCatechin: 40.0, kAminoAcid: 70.0, kCaffeine: 50.0, kPectin: 30.0, kPolysaccharide: 25.0, kAroma: 55.0,
  sensCatechin: 3.0, sensAminoAcid: 0.8, sensCaffeine: 2.0, sensPectin: 2.5, sensPolysaccharide: 1.5, sensAroma: 1.2,
  aromaVolatilityBase: 0.30,
};

function makeProfile(overrides: Partial<TeaCompProfile>): TeaCompProfile {
  return { ...BASE_COMP, ...overrides };
}

export const TEA_COMP_PROFILE_TABLE: Record<TeaType, TeaCompProfile> = {
  [TeaType.GreenNormal]: makeProfile({
    sCatechin: 150.0, sAminoAcid: 30.0, sCaffeine: 30.0, sAroma: 22.0,
    kAminoAcid: 90.0, sensAminoAcid: 0.5, sensCatechin: 2.5,
    kAroma: 75.0, aromaVolatilityBase: 0.22,
  }),
  [TeaType.GreenSencha]: makeProfile({
    sCatechin: 150.0, sAminoAcid: 30.0, sCaffeine: 30.0, sAroma: 22.0,
    kAminoAcid: 0.90, sensAminoAcid: 0.5, sensCatechin: 2.5,
    kAroma: 0.75, aromaVolatilityBase: 0.22,
  }),
  [TeaType.GreenFukamushi]: makeProfile({
    sCatechin: 150.0, sAminoAcid: 30.0, sCaffeine: 30.0, sAroma: 22.0,
    kAminoAcid: 0.90, sensAminoAcid: 0.5, sensCatechin: 2.5,
    kAroma: 0.75, aromaVolatilityBase: 0.22,
  }),
  [TeaType.GreenGyokuro]: makeProfile({
    sCatechin: 130.0, sAminoAcid: 60.0,
    kAminoAcid: 120.0, sensAminoAcid: 0.3, sensCatechin: 3.5,
    sAroma: 28.0, kAroma: 90.0, aromaVolatilityBase: 0.18,
  }),
  [TeaType.White]: makeProfile({
    sCatechin: 140.0, sAminoAcid: 35.0, sAroma: 24.0,
    kCatechin: 50.0, sensCatechin: 1.8, sensAminoAcid: 0.6,
    kAroma: 65.0, aromaVolatilityBase: 0.20,
  }),
  [TeaType.Yellow]: makeProfile({
    sCatechin: 135.0, sAminoAcid: 28.0, sAroma: 20.0,
    kCatechin: 45.0, sensCatechin: 2.0, sensAminoAcid: 0.7,
    kAroma: 60.0,
  }),
  [TeaType.Black]: makeProfile({
    sCatechin: 100.0, sAminoAcid: 10.0, sCaffeine: 45.0, sAroma: 16.0,
    kCatechin: 60.0, kCaffeine: 60.0, kAroma: 50.0,
    aromaVolatilityBase: 0.38,
  }),
  [TeaType.Puerh]: makeProfile({
    sCatechin: 90.0, sPolysaccharide: 40.0,
    kPolysaccharide: 45.0, sAroma: 12.0, kAroma: 35.0,
    aromaVolatilityBase: 0.42,
  }),
  [TeaType.Oolong]: makeProfile({
    // defaults
  }),
  [TeaType.Tibetan]: makeProfile({
    // defaults
  }),
};

// Tea-type specific aroma constants (DoD flat lookups)
export const AROMA_PERCEPTION_FLOOR: Record<TeaType, number> = {
  [TeaType.Puerh]: 0.30, [TeaType.Tibetan]: 0.30,
  [TeaType.Black]: 0.40, [TeaType.Oolong]: 0.40,
  [TeaType.GreenGyokuro]: 0.36, [TeaType.White]: 0.36,
  [TeaType.GreenNormal]: 0.35, [TeaType.GreenSencha]: 0.35,
  [TeaType.GreenFukamushi]: 0.35, [TeaType.Yellow]: 0.35,
};

export const AROMA_BALANCE_TOLERANCE: Record<TeaType, number> = {
  [TeaType.Puerh]: 0.08, [TeaType.Tibetan]: 0.08,
  [TeaType.Black]: 0.05, [TeaType.Oolong]: 0.05,
  [TeaType.GreenNormal]: 0.04, [TeaType.GreenSencha]: 0.04,
  [TeaType.GreenFukamushi]: 0.04, [TeaType.GreenGyokuro]: 0.04,
  [TeaType.White]: 0.04, [TeaType.Yellow]: 0.04,
};

export const AROMA_SIGNAL_FLOOR: Record<TeaType, number> = {
  [TeaType.Puerh]: 0.45, [TeaType.Tibetan]: 0.45,
  [TeaType.Black]: 0.70, [TeaType.Oolong]: 0.70,
  [TeaType.GreenNormal]: 0.60, [TeaType.GreenSencha]: 0.60,
  [TeaType.GreenFukamushi]: 0.60, [TeaType.GreenGyokuro]: 0.60,
  [TeaType.White]: 0.60, [TeaType.Yellow]: 0.60,
};

export const AROMA_BALANCE_MIN_TIME_MS: Record<TeaType, number> = {
  [TeaType.Puerh]: 25000, [TeaType.Tibetan]: 30000,
  [TeaType.Black]: 14000, [TeaType.Oolong]: 14000,
  [TeaType.GreenNormal]: 10000, [TeaType.GreenSencha]: 10000,
  [TeaType.GreenFukamushi]: 10000, [TeaType.GreenGyokuro]: 10000,
  [TeaType.White]: 10000, [TeaType.Yellow]: 10000,
};

export const AROMA_STOP_FLUX_MIN_EXT = 0.06;
export const AROMA_STOP_FLUX_MIN_VOL = 0.04;
