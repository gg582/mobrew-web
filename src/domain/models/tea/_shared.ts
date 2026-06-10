import type { TeaCompProfile } from '../../types';

export const BASE_COMP: TeaCompProfile = {
  sCatechin: 120.0,
  sAminoAcid: 20.0,
  sCaffeine: 35.0,
  sPectin: 18.0,
  sPolysaccharide: 22.0,
  sAroma: 18.0,
  kCatechin: 0.40,
  kAminoAcid: 0.70,
  kCaffeine: 0.50,
  kPectin: 0.30,
  kPolysaccharide: 0.25,
  kAroma: 0.55,
  sensCatechin: 3.0,
  sensAminoAcid: 0.8,
  sensCaffeine: 2.0,
  sensPectin: 2.5,
  sensPolysaccharide: 1.5,
  sensAroma: 1.2,
  aromaVolatilityBase: 0.30,
};

export function makeCompProfile(overrides: Partial<TeaCompProfile>): TeaCompProfile {
  return { ...BASE_COMP, ...overrides };
}
