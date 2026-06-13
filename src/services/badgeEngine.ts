import { TeaType } from '@/domain/enums';
import type { BadgeDefinition, BrewLogEntry, UserBadge } from '@/domain/appTypes';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Activity
  {
    id: 'activity_first_brew',
    icon: 'Coffee',
    nameKey: 'badgeActivityFirstBrew',
    descKey: 'badgeActivityFirstBrewDesc',
    category: 'activity',
    condition: 'Brew 1 cup',
    maxProgress: 1,
  },
  {
    id: 'activity_steady_hand',
    icon: 'Clock',
    nameKey: 'badgeActivitySteadyHand',
    descKey: 'badgeActivitySteadyHandDesc',
    category: 'activity',
    condition: 'Brew 10 cups',
    maxProgress: 10,
  },
  {
    id: 'activity_brewing_regular',
    icon: 'Calendar',
    nameKey: 'badgeActivityBrewingRegular',
    descKey: 'badgeActivityBrewingRegularDesc',
    category: 'activity',
    condition: 'Brew 50 cups',
    maxProgress: 50,
  },
  {
    id: 'activity_master_brewer',
    icon: 'Crown',
    nameKey: 'badgeActivityMasterBrewer',
    descKey: 'badgeActivityMasterBrewerDesc',
    category: 'activity',
    condition: 'Brew 100 cups',
    maxProgress: 100,
  },

  // Explorer
  {
    id: 'explorer_tea_novice',
    icon: 'Leaf',
    nameKey: 'badgeExplorerTeaNovice',
    descKey: 'badgeExplorerTeaNoviceDesc',
    category: 'explorer',
    condition: 'Try 3 tea types',
    maxProgress: 3,
  },
  {
    id: 'explorer_tea_traveler',
    icon: 'Globe',
    nameKey: 'badgeExplorerTeaTraveler',
    descKey: 'badgeExplorerTeaTravelerDesc',
    category: 'explorer',
    condition: 'Try 6 tea types',
    maxProgress: 6,
  },
  {
    id: 'explorer_tea_connoisseur',
    icon: 'BookOpen',
    nameKey: 'badgeExplorerTeaConnoisseur',
    descKey: 'badgeExplorerTeaConnoisseurDesc',
    category: 'explorer',
    condition: 'Try all 10 tea types',
    maxProgress: 10,
  },
  {
    id: 'explorer_temp_scout',
    icon: 'Thermometer',
    nameKey: 'badgeExplorerTempScout',
    descKey: 'badgeExplorerTempScoutDesc',
    category: 'explorer',
    condition: 'Brew at 5 temperatures',
    maxProgress: 5,
  },
  {
    id: 'explorer_temp_nomad',
    icon: 'Sun',
    nameKey: 'badgeExplorerTempNomad',
    descKey: 'badgeExplorerTempNomadDesc',
    category: 'explorer',
    condition: 'Brew at 10 temperatures',
    maxProgress: 10,
  },
  {
    id: 'explorer_vessel_curator',
    icon: 'CupSoda',
    nameKey: 'badgeExplorerVesselCurator',
    descKey: 'badgeExplorerVesselCuratorDesc',
    category: 'explorer',
    condition: 'Use 3 vessels',
    maxProgress: 3,
  },
  {
    id: 'explorer_vessel_collector',
    icon: 'ShoppingBag',
    nameKey: 'badgeExplorerVesselCollector',
    descKey: 'badgeExplorerVesselCollectorDesc',
    category: 'explorer',
    condition: 'Use all 8 vessels',
    maxProgress: 8,
  },

  // Precision
  {
    id: 'precision_perfect_cup',
    icon: 'Star',
    nameKey: 'badgePrecisionPerfectCup',
    descKey: 'badgePrecisionPerfectCupDesc',
    category: 'precision',
    condition: '5 brews rated 5 stars',
    maxProgress: 5,
  },
  {
    id: 'precision_flawless_judge',
    icon: 'Award',
    nameKey: 'badgePrecisionFlawlessJudge',
    descKey: 'badgePrecisionFlawlessJudgeDesc',
    category: 'precision',
    condition: '20 brews rated 5 stars',
    maxProgress: 20,
  },
  {
    id: 'precision_balanced_artisan',
    icon: 'Scale',
    nameKey: 'badgePrecisionBalancedArtisan',
    descKey: 'badgePrecisionBalancedArtisanDesc',
    category: 'precision',
    condition: 'Balance score 0.85+ x10',
    maxProgress: 10,
  },
  {
    id: 'precision_harmony_master',
    icon: 'Heart',
    nameKey: 'badgePrecisionHarmonyMaster',
    descKey: 'badgePrecisionHarmonyMasterDesc',
    category: 'precision',
    condition: 'Balance score 0.90+ x25',
    maxProgress: 25,
  },

  // Streak
  {
    id: 'streak_consistent_sipper',
    icon: 'Zap',
    nameKey: 'badgeStreakConsistentSipper',
    descKey: 'badgeStreakConsistentSipperDesc',
    category: 'streak',
    condition: '3 consecutive days',
    maxProgress: 3,
  },
  {
    id: 'streak_week_warrior',
    icon: 'Flame',
    nameKey: 'badgeStreakWeekWarrior',
    descKey: 'badgeStreakWeekWarriorDesc',
    category: 'streak',
    condition: '7 consecutive days',
    maxProgress: 7,
  },
  {
    id: 'streak_monthly_devotee',
    icon: 'Infinity',
    nameKey: 'badgeStreakMonthlyDevotee',
    descKey: 'badgeStreakMonthlyDevoteeDesc',
    category: 'streak',
    condition: '30 consecutive days',
    maxProgress: 30,
  },

  // Archetype
  {
    id: 'archetype_zephyr',
    icon: 'Wind',
    nameKey: 'badgeArchetypeZephyr',
    descKey: 'badgeArchetypeZephyrDesc',
    category: 'archetype',
    condition: 'Dominant green tea style',
    maxProgress: 1,
  },
  {
    id: 'archetype_golden_drift',
    icon: 'Sunrise',
    nameKey: 'badgeArchetypeGoldenDrift',
    descKey: 'badgeArchetypeGoldenDriftDesc',
    category: 'archetype',
    condition: 'Dominant black/oolong style',
    maxProgress: 1,
  },
  {
    id: 'archetype_obsidian',
    icon: 'Moon',
    nameKey: 'badgeArchetypeObsidian',
    descKey: 'badgeArchetypeObsidianDesc',
    category: 'archetype',
    condition: 'Dominant pu-erh/Tibetan style',
    maxProgress: 1,
  },
  {
    id: 'archetype_blossom',
    icon: 'Flower2',
    nameKey: 'badgeArchetypeBlossom',
    descKey: 'badgeArchetypeBlossomDesc',
    category: 'archetype',
    condition: 'Dominant white/yellow style',
    maxProgress: 1,
  },
  {
    id: 'archetype_nova',
    icon: 'Sparkles',
    nameKey: 'badgeArchetypeNova',
    descKey: 'badgeArchetypeNovaDesc',
    category: 'archetype',
    condition: 'No single style dominates',
    maxProgress: 1,
  },
];

function toDayKey(timestamp: number): string {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function computeCurrentStreak(logs: BrewLogEntry[]): number {
  if (logs.length === 0) return 0;
  const days = Array.from(new Set(logs.map((l) => toDayKey(l.timestamp)))).sort();
  let streak = 1;
  for (let i = days.length - 1; i > 0; i--) {
    const curr = new Date(`${days[i]}T00:00:00`).getTime();
    const prev = new Date(`${days[i - 1]}T00:00:00`).getTime();
    const diff = (curr - prev) / 86_400_000;
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function evaluateArchetype(logs: BrewLogEntry[]): string | null {
  const recent = logs.slice(-20);
  if (recent.length < 5) return null;

  const scores: Record<string, number> = {
    archetype_zephyr: 0,
    archetype_golden_drift: 0,
    archetype_obsidian: 0,
    archetype_blossom: 0,
  };

  for (const log of recent) {
    switch (log.teaType) {
      case TeaType.GreenNormal:
      case TeaType.GreenGyokuro:
      case TeaType.GreenSencha:
      case TeaType.GreenFukamushi:
        scores.archetype_zephyr += 2;
        break;
      case TeaType.Black:
      case TeaType.Oolong:
        scores.archetype_golden_drift += 2;
        break;
      case TeaType.Puerh:
      case TeaType.Tibetan:
        scores.archetype_obsidian += 2;
        break;
      case TeaType.White:
      case TeaType.Yellow:
        scores.archetype_blossom += 2;
        break;
    }
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topScore = ranked[0][1];
  const distinctTeaTypes = new Set(recent.map((l) => l.teaType)).size;

  if (topScore < 6 || distinctTeaTypes >= 7) return 'archetype_nova';
  return ranked[0][0];
}

function progressFor(def: BadgeDefinition, metrics: ReturnType<typeof computeMetrics>): number {
  switch (def.id) {
    case 'activity_first_brew':
    case 'activity_steady_hand':
    case 'activity_brewing_regular':
    case 'activity_master_brewer':
      return metrics.totalBrews;

    case 'explorer_tea_novice':
    case 'explorer_tea_traveler':
    case 'explorer_tea_connoisseur':
      return metrics.distinctTeaTypes;

    case 'explorer_temp_scout':
    case 'explorer_temp_nomad':
      return metrics.distinctTemps;

    case 'explorer_vessel_curator':
    case 'explorer_vessel_collector':
      return metrics.distinctVessels;

    case 'precision_perfect_cup':
    case 'precision_flawless_judge':
      return metrics.fiveStarCount;

    case 'precision_balanced_artisan':
      return metrics.balancedCount;

    case 'precision_harmony_master':
      return metrics.harmonyCount;

    case 'streak_consistent_sipper':
    case 'streak_week_warrior':
    case 'streak_monthly_devotee':
      return metrics.streakDays;

    default:
      return 0;
  }
}

function computeMetrics(logs: BrewLogEntry[]) {
  return {
    totalBrews: logs.length,
    distinctTeaTypes: new Set(logs.map((l) => l.teaType)).size,
    distinctTemps: new Set(logs.map((l) => Math.round(l.parameters.temperature))).size,
    distinctVessels: new Set(logs.map((l) => l.parameters.vessel)).size,
    fiveStarCount: logs.filter((l) => l.rating >= 5).length,
    balancedCount: logs.filter((l) => l.balanceScore >= 0.85).length,
    harmonyCount: logs.filter((l) => l.balanceScore >= 0.9).length,
    streakDays: computeCurrentStreak(logs),
  };
}

export function evaluateAfterBrew(
  log: BrewLogEntry,
  history: BrewLogEntry[],
  existingBadges: UserBadge[]
): { updatedBadges: UserBadge[]; newUnlocks: string[]; archetypeBadgeId: string | null } {
  const allLogs = history.filter((l) => l.id !== log.id);
  allLogs.push(log);
  // keep deterministic order by timestamp asc so recent logs are at the end
  allLogs.sort((a, b) => a.timestamp - b.timestamp);

  const metrics = computeMetrics(allLogs);
  const archetypeBadgeId = evaluateArchetype(allLogs);

  const existingMap = new Map(existingBadges.map((b) => [b.badgeId, b]));
  const newUnlocks: string[] = [];

  const updatedBadges: UserBadge[] = BADGE_DEFINITIONS.map((def) => {
    let progress = Math.min(progressFor(def, metrics), def.maxProgress);

    if (def.category === 'archetype' && def.id === archetypeBadgeId) {
      progress = def.maxProgress;
    }

    const prev = existingMap.get(def.id);
    const earned = progress >= def.maxProgress;

    if (earned && (!prev || !prev.earnedAt)) {
      newUnlocks.push(def.id);
    }

    if (prev) {
      return {
        ...prev,
        progress,
        earnedAt: prev.earnedAt ?? (earned ? new Date().toISOString() : undefined),
      };
    }

    return {
      id: def.id,
      badgeId: def.id,
      progress,
      earnedAt: earned ? new Date().toISOString() : undefined,
    };
  });

  return { updatedBadges, newUnlocks, archetypeBadgeId };
}
