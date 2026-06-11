import { type ComponentType } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  Clock,
  Coffee,
  Crown,
  CupSoda,
  Flame,
  Flower2,
  Globe,
  Heart,
  Infinity,
  Leaf,
  Moon,
  Scale,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  Sunrise,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react';
import { i18n } from '@/core/i18n/TranslationManager';
import { GlassCard } from '@/components/ui/GlassCard';
import { useBadgeStore } from '@/stores/badgeStore';
import { BADGE_TEXT_FALLBACK } from '@/services/badgeEngine';
import { cn } from '@/lib/utils';
import type { BadgeDefinition, UserBadge } from '@/domain/appTypes';
import type { TranslationKey } from '@/core/i18n/ITranslationStrategy';

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Coffee,
  Clock,
  Calendar,
  Crown,
  Leaf,
  Globe,
  BookOpen,
  Thermometer,
  Sun,
  CupSoda,
  ShoppingBag,
  Star,
  Award,
  Scale,
  Heart,
  Zap,
  Flame,
  Infinity,
  Wind,
  Sunrise,
  Moon,
  Flower2,
  Sparkles,
};

const CATEGORY_LABELS: Record<BadgeDefinition['category'], TranslationKey | string> = {
  activity: 'trophyActivity',
  explorer: 'trophyExplorer',
  precision: 'trophyPrecision',
  streak: 'trophyStreak',
  archetype: 'trophyArchetype',
};

const ARCHETYPE_AURA: Record<string, string> = {
  archetype_zephyr: 'from-emerald-400 via-teal-400 to-cyan-400',
  archetype_golden_drift: 'from-amber-400 via-orange-400 to-rose-400',
  archetype_obsidian: 'from-slate-500 via-purple-600 to-indigo-600',
  archetype_blossom: 'from-pink-400 via-rose-300 to-fuchsia-400',
  archetype_nova: 'from-violet-400 via-fuchsia-400 to-pink-400',
};

function tBadge(key: string): string {
  const translated = i18n.tRaw(key);
  if (translated !== key) return translated;
  return BADGE_TEXT_FALLBACK[key] ?? key;
}

function ArchetypeHero({
  def,
  userBadge,
}: {
  def: BadgeDefinition;
  userBadge?: UserBadge;
}) {
  const Icon = ICON_MAP[def.icon] ?? Activity;
  const aura = ARCHETYPE_AURA[def.id] ?? 'from-slate-400 to-slate-600';
  const earnedAt = userBadge?.earnedAt;

  return (
    <div
      className={cn(
        'relative rounded-2xl p-1 bg-gradient-to-r shadow-lg',
        aura
      )}
    >
      <GlassCard className="relative overflow-hidden bg-black/30" hover={false}>
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
        <div className="relative flex items-center gap-4 sm:gap-6">
          <div className="flex-shrink-0 p-3 sm:p-4 rounded-full bg-white/10 backdrop-blur-sm">
            <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-white/80">
              {i18n.t('trophyArchetype')}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
              {tBadge(def.nameKey)}
            </h2>
            <p className="text-sm text-white/80 line-clamp-2">{tBadge(def.descKey)}</p>
            {earnedAt && (
              <p className="text-xs text-white/60 mt-1">
                {format(parseISO(earnedAt), 'PPP')}
              </p>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function BadgeItem({
  def,
  userBadge,
}: {
  def: BadgeDefinition;
  userBadge?: UserBadge;
}) {
  const Icon = ICON_MAP[def.icon] ?? Activity;
  const progress = userBadge?.progress ?? 0;
  const earned = progress >= def.maxProgress;
  const earnedAt = userBadge?.earnedAt;

  return (
    <GlassCard
      className={cn(
        'flex flex-col gap-3',
        !earned && 'opacity-60 grayscale'
      )}
      hover
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex-shrink-0 p-2.5 rounded-full',
            earned
              ? 'bg-tea-green/15 text-tea-green'
              : 'bg-white/5 text-slate-400'
          )}
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-100 truncate">
            {tBadge(def.nameKey)}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2">
            {tBadge(def.descKey)}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 text-xs">
        {earned ? (
          <>
            <span className="text-tea-green font-medium">
              {earnedAt ? format(parseISO(earnedAt), 'PPP') : '—'}
            </span>
            <Star className="w-4 h-4 text-tea-green" />
          </>
        ) : (
          <>
            <span className="text-slate-400">{i18n.t('trophyLocked')}</span>
            <span className="font-mono text-slate-200">
              {progress}/{def.maxProgress}
            </span>
          </>
        )}
      </div>
    </GlassCard>
  );
}

export default function TrophyPage() {
  const { definitions, userBadges, archetypeBadgeId, loading } = useBadgeStore();

  const badgeMap = new Map(userBadges.map((b) => [b.badgeId, b]));
  const archetypeDef = definitions.find((d) => d.id === archetypeBadgeId);

  const categoryOrder: BadgeDefinition['category'][] = [
    'activity',
    'explorer',
    'precision',
    'streak',
    'archetype',
  ];

  const byCategory = new Map<
    BadgeDefinition['category'],
    BadgeDefinition[]
  >();
  for (const def of definitions) {
    const list = byCategory.get(def.category) ?? [];
    list.push(def);
    byCategory.set(def.category, list);
  }

  if (loading && definitions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">{i18n.t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-glow">
          {i18n.t('trophyTitle')}
        </h1>
        <p className="text-sm text-slate-400">
          {definitions.length} {i18n.t('trophyProgress').toLowerCase()}
        </p>
      </header>

      {archetypeDef && (
        <ArchetypeHero
          def={archetypeDef}
          userBadge={badgeMap.get(archetypeDef.id)}
        />
      )}

      <section className="space-y-6">
        {categoryOrder.map((category) => {
          const items = byCategory.get(category) ?? [];
          if (items.length === 0) return null;

          return (
            <div key={category}>
              <h2 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-tea-green" />
                {i18n.t(CATEGORY_LABELS[category])}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((def) => (
                  <BadgeItem
                    key={def.id}
                    def={def}
                    userBadge={badgeMap.get(def.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
