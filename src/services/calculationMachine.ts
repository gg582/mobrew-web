import { TeaType } from '@/domain/enums';
import type { BrewLogEntry, StrengthClassification } from '@/domain/appTypes';

export interface CalculationResult {
  extractionYieldPercent: number;
  tdsMgMl: number;
  balanceScore: number;
  strength: StrengthClassification;
  suggestionKey: 'calcSuggestionHot' | 'calcSuggestionCold' | 'calcSuggestionRatio' | null;
  idealYieldRange: [number, number];
}

const YIELD_RANGES: Record<TeaType, [number, number]> = {
  [TeaType.GreenNormal]: [18, 24],
  [TeaType.White]: [18, 24],
  [TeaType.Black]: [22, 28],
  [TeaType.Oolong]: [20, 26],
  [TeaType.Yellow]: [18, 24],
  [TeaType.Puerh]: [22, 28],
  [TeaType.GreenGyokuro]: [18, 22],
  [TeaType.GreenSencha]: [18, 22],
  [TeaType.GreenFukamushi]: [18, 22],
  [TeaType.Tibetan]: [24, 30],
};

const RATIO_RANGES: Record<TeaType, [number, number]> = {
  [TeaType.GreenNormal]: [0.5, 0.9],
  [TeaType.White]: [0.5, 0.9],
  [TeaType.Black]: [0.2, 0.4],
  [TeaType.Oolong]: [0.4, 0.7],
  [TeaType.Yellow]: [0.5, 0.9],
  [TeaType.Puerh]: [0.2, 0.4],
  [TeaType.GreenGyokuro]: [0.8, 1.2],
  [TeaType.GreenSencha]: [0.8, 1.2],
  [TeaType.GreenFukamushi]: [0.8, 1.2],
  [TeaType.Tibetan]: [0.3, 0.6],
};

const STEEP_WINDOWS: Record<TeaType, [number, number]> = {
  [TeaType.GreenNormal]: [120, 180],
  [TeaType.White]: [180, 300],
  [TeaType.Black]: [180, 240],
  [TeaType.Oolong]: [30, 60],
  [TeaType.Yellow]: [120, 180],
  [TeaType.Puerh]: [20, 60],
  [TeaType.GreenGyokuro]: [120, 150],
  [TeaType.GreenSencha]: [60, 90],
  [TeaType.GreenFukamushi]: [45, 75],
  [TeaType.Tibetan]: [300, 600],
};

export function idealYieldRange(teaType: TeaType): [number, number] {
  return YIELD_RANGES[teaType] ?? [18, 28];
}

function idealTheanineCatechinRange(teaType: TeaType): [number, number] {
  return RATIO_RANGES[teaType] ?? [0.4, 0.8];
}

function recommendedSteepWindow(teaType: TeaType): [number, number] {
  return STEEP_WINDOWS[teaType] ?? [60, 180];
}

function computeBalanceScore(ratio: number, [min, max]: [number, number]): number {
  if (Number.isFinite(ratio) && ratio >= min && ratio <= max) return 100;
  const dist = Math.min(Math.abs(ratio - min), Math.abs(ratio - max));
  return Math.max(0, 100 - dist * 200);
}

function classifyStrength(
  extractionYieldPercent: number,
  steepTimeSec: number | undefined,
  teaType: TeaType
): StrengthClassification {
  const [yieldMin, yieldMax] = idealYieldRange(teaType);
  const [timeMin, timeMax] = recommendedSteepWindow(teaType);

  const yieldLow = extractionYieldPercent < yieldMin - 2;
  const yieldHigh = extractionYieldPercent > yieldMax + 2;
  const time = steepTimeSec ?? 0;
  const timeLow = time > 0 && time < timeMin * 0.7;
  const timeHigh = time > timeMax * 1.3;

  if (yieldLow || timeLow) return 'under-extracted';
  if (yieldHigh || timeHigh) return 'over-extracted';
  return 'optimal';
}

export function calculate(log: BrewLogEntry): CalculationResult {
  const comp = log.composition;
  const leafMass = log.parameters.leafMass || 1;
  const waterVolume = log.parameters.waterVolume || 1;

  const totalDissolvedSolidsMg =
    comp.catechin +
    comp.theanine +
    comp.caffeine +
    comp.pectin +
    comp.polysaccharide +
    comp.aroma;

  const extractionYieldPercent = (totalDissolvedSolidsMg / leafMass) * 100;
  const tdsMgMl = totalDissolvedSolidsMg / waterVolume;

  const ratio = comp.catechin === 0 ? 0 : comp.theanine / comp.catechin;
  const balanceScore = computeBalanceScore(
    ratio,
    idealTheanineCatechinRange(log.teaType)
  );

  const strength = classifyStrength(
    extractionYieldPercent,
    log.parameters.steepTimeSec,
    log.teaType
  );

  let suggestionKey: CalculationResult['suggestionKey'] = null;
  if (strength === 'over-extracted' && comp.catechin > 15) {
    suggestionKey = 'calcSuggestionCold';
  } else if (strength === 'under-extracted' && totalDissolvedSolidsMg < 20) {
    suggestionKey = 'calcSuggestionHot';
  } else if (strength === 'optimal' && tdsMgMl < 1.5) {
    suggestionKey = 'calcSuggestionRatio';
  }

  return {
    extractionYieldPercent,
    tdsMgMl,
    balanceScore: Math.round(balanceScore * 10) / 10,
    strength,
    suggestionKey,
    idealYieldRange: idealYieldRange(log.teaType),
  };
}
export default calculate;
