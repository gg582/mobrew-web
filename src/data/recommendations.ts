import { BrewingRegion, TeaType } from '@/domain/enums';
import { RecommendationResult, RecommendationResultBuilder } from '@/domain/models/RecommendationResult';
export { RecommendationResult, RecommendationResultBuilder };

export type TasteProfile = 'light' | 'smooth' | 'rich' | 'fragrant' | 'unique';
export type MoodGoal = 'relax' | 'focus' | 'energy' | 'digestion';
export type CaffeinePref = 'low' | 'medium' | 'high';

interface RecEntry {
  teaType: TeaType;
  region: BrewingRegion;
  name: string;
  tags: string[];
  tastes: TasteProfile[];
  moods: MoodGoal[];
  caffeine: CaffeinePref[];
  reasonKey: string;
  brewTimeHint: string;
  tempHint: string;
}

const RECOMMENDATION_DB: RecEntry[] = [
  {
    teaType: TeaType.GreenSencha, region: BrewingRegion.EastAsia,
    name: 'Japanese Sencha', tags: ['Green Tea', 'Japan', 'Clean'],
    tastes: ['light', 'fragrant'], moods: ['focus', 'relax'], caffeine: ['low', 'medium'],
    reasonKey: 'recSencha', brewTimeHint: '1min ~ 1min 30s', tempHint: '70°C ~ 75°C',
  },
  {
    teaType: TeaType.GreenGyokuro, region: BrewingRegion.EastAsia,
    name: 'Gyokuro (Jade Dew)', tags: ['Premium Green', 'Japan', 'Smooth'],
    tastes: ['smooth', 'fragrant'], moods: ['relax', 'focus'], caffeine: ['low', 'medium'],
    reasonKey: 'recGyokuro', brewTimeHint: '2min ~ 2min 30s', tempHint: '50°C ~ 60°C',
  },
  {
    teaType: TeaType.GreenFukamushi, region: BrewingRegion.EastAsia,
    name: 'Fukamushi Sencha', tags: ['Deep Steam', 'Japan', 'Rich'],
    tastes: ['rich', 'light'], moods: ['energy', 'focus'], caffeine: ['medium', 'high'],
    reasonKey: 'recFukamushi', brewTimeHint: '1min', tempHint: '70°C ~ 80°C',
  },
  {
    teaType: TeaType.White, region: BrewingRegion.British,
    name: 'White Tea (Silver Needle)', tags: ['White Tea', 'Smooth', 'Low Caffeine'],
    tastes: ['smooth', 'light', 'fragrant'], moods: ['relax'], caffeine: ['low'],
    reasonKey: 'recWhite', brewTimeHint: '3min ~ 5min', tempHint: '75°C ~ 85°C',
  },
  {
    teaType: TeaType.Black, region: BrewingRegion.British,
    name: 'Black Tea (Assam/Keemun)', tags: ['Black Tea', 'Rich', 'Morning'],
    tastes: ['rich', 'fragrant'], moods: ['energy'], caffeine: ['medium', 'high'],
    reasonKey: 'recBlack', brewTimeHint: '3min ~ 4min', tempHint: '95°C ~ 100°C',
  },
  {
    teaType: TeaType.Oolong, region: BrewingRegion.SoutheastAsia,
    name: 'Oolong (Tie Guan Yin)', tags: ['Oolong', 'Floral', 'Multi-infusion'],
    tastes: ['fragrant', 'smooth', 'unique'], moods: ['focus', 'relax'], caffeine: ['medium'],
    reasonKey: 'recOolong', brewTimeHint: '30s ~ 1min (multi)', tempHint: '85°C ~ 95°C',
  },
  {
    teaType: TeaType.Puerh, region: BrewingRegion.SoutheastAsia,
    name: 'Aged Pu-erh', tags: ['Pu-erh', 'Aged', 'Digestion'],
    tastes: ['unique', 'rich'], moods: ['digestion', 'relax'], caffeine: ['low', 'medium'],
    reasonKey: 'recPuerh', brewTimeHint: '20s ~ 1min (multi)', tempHint: '95°C ~ 100°C',
  },
  {
    teaType: TeaType.Tibetan, region: BrewingRegion.Tibetan,
    name: 'Tibetan Butter Tea', tags: ['Butter Tea', 'Himalaya', 'Special'],
    tastes: ['unique', 'rich'], moods: ['energy', 'digestion'], caffeine: ['high'],
    reasonKey: 'recTibetan', brewTimeHint: '5min ~ 10min (boil)', tempHint: '100°C (boil)',
  },
  {
    teaType: TeaType.Yellow, region: BrewingRegion.EastAsia,
    name: 'Yellow Tea (Junshan Yinzhen)', tags: ['Yellow Tea', 'Rare', 'Smooth'],
    tastes: ['smooth', 'light'], moods: ['relax', 'focus'], caffeine: ['low', 'medium'],
    reasonKey: 'recYellow', brewTimeHint: '2min ~ 3min', tempHint: '75°C ~ 85°C',
  },
  {
    teaType: TeaType.GreenNormal, region: BrewingRegion.WesternModern,
    name: 'Classic Green Tea', tags: ['Green Tea', 'Universal', 'Clean'],
    tastes: ['light', 'smooth'], moods: ['relax', 'focus', 'energy'], caffeine: ['low', 'medium'],
    reasonKey: 'recGreenNormal', brewTimeHint: '2min ~ 3min', tempHint: '80°C ~ 85°C',
  },
];

export function getRecommendation(
  taste: TasteProfile,
  mood: MoodGoal,
  caffeine: CaffeinePref
): RecommendationResult {
  let best = RECOMMENDATION_DB[0];
  let bestScore = -1;

  for (const item of RECOMMENDATION_DB) {
    let score = 0;
    if (item.tastes.includes(taste)) score += 3;
    if (item.moods.includes(mood)) score += 3;
    if (item.caffeine.includes(caffeine)) score += 2;
    if (taste === 'light' && item.tastes.includes('smooth')) score += 1;
    if (mood === 'relax' && item.tastes.includes('smooth')) score += 1;
    if (mood === 'energy' && item.tastes.includes('rich')) score += 1;

    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return new RecommendationResultBuilder()
    .setTeaType(best.teaType)
    .setRegion(best.region)
    .setName(best.name)
    .setReasonKey(best.reasonKey)
    .setTags(best.tags)
    .setBrewTimeHint(best.brewTimeHint)
    .setTempHint(best.tempHint)
    .build();
}

export const TASTE_OPTIONS: Array<{ value: TasteProfile; labelKey: string; descKey: string; emoji: string }> = [
  { value: 'light', labelKey: 'tasteLight', descKey: 'tasteLightDesc', emoji: '🍃' },
  { value: 'smooth', labelKey: 'tasteSmooth', descKey: 'tasteSmoothDesc', emoji: '🍯' },
  { value: 'rich', labelKey: 'tasteRich', descKey: 'tasteRichDesc', emoji: '🍫' },
  { value: 'fragrant', labelKey: 'tasteFragrant', descKey: 'tasteFragrantDesc', emoji: '🌸' },
  { value: 'unique', labelKey: 'tasteUnique', descKey: 'tasteUniqueDesc', emoji: '✨' },
];

export const MOOD_OPTIONS: Array<{ value: MoodGoal; labelKey: string; emoji: string }> = [
  { value: 'relax', labelKey: 'moodRelax', emoji: '😌' },
  { value: 'focus', labelKey: 'moodFocus', emoji: '🧘' },
  { value: 'energy', labelKey: 'moodEnergy', emoji: '⚡' },
  { value: 'digestion', labelKey: 'moodDigestion', emoji: '🍲' },
];

export const CAFFEINE_OPTIONS: Array<{ value: CaffeinePref; labelKey: string; emoji: string }> = [
  { value: 'low', labelKey: 'caffeineLow', emoji: '🌙' },
  { value: 'medium', labelKey: 'caffeineMedium', emoji: '☕' },
  { value: 'high', labelKey: 'caffeineHigh', emoji: '🔥' },
];
