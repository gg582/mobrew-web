import { useEffect, useMemo, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { i18n } from '@/core/i18n/TranslationManager';
import { apiClient } from '@/infrastructure/api/apiClient';
import { usePresetStore } from '@/stores/presetStore';
import { encodeRecipe } from '@/services/recipeHash';
import { BADGE_DEFINITIONS } from '@/services/badgeEngine';
import { TeaType } from '@/domain/enums';
import type { CommunityRecipe, BrewParameters } from '@/domain/appTypes';
import {
  Search,
  ArrowUp,
  Upload,
  Share2,
  Thermometer,
  Clock,
  Scale,
  Wind,
  Sunrise,
  Moon,
  Flower2,
  Sparkles,
  Activity,
  Check,
} from 'lucide-react';
import type { ComponentType } from 'react';

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Wind,
  Sunrise,
  Moon,
  Flower2,
  Sparkles,
};

const ARCHETYPE_AURA: Record<string, string> = {
  archetype_zephyr: 'from-emerald-400 via-teal-400 to-cyan-400',
  archetype_golden_drift: 'from-amber-400 via-orange-400 to-rose-400',
  archetype_obsidian: 'from-slate-500 via-purple-600 to-indigo-600',
  archetype_blossom: 'from-pink-400 via-rose-300 to-fuchsia-400',
  archetype_nova: 'from-violet-400 via-fuchsia-400 to-pink-400',
};

type SortMode = 'recent' | 'upvoted' | 'type';

function getTeaIcon(teaType: TeaType): string {
  switch (teaType) {
    case TeaType.GreenNormal:
    case TeaType.GreenGyokuro:
    case TeaType.GreenSencha:
    case TeaType.GreenFukamushi:
      return '🍵';
    case TeaType.Black:
      return '☕';
    case TeaType.Oolong:
      return '🌿';
    case TeaType.White:
      return '🌸';
    case TeaType.Puerh:
      return '🍂';
    case TeaType.Yellow:
      return '💛';
    case TeaType.Tibetan:
      return '🧈';
    default:
      return '🍵';
  }
}

function formatSteepTime(seconds?: number): string {
  if (seconds === undefined || seconds === null) return '-';
  if (seconds < 60) return `${seconds}s`;
  const min = Math.round(seconds / 60);
  return `${min} min`;
}

function formatRatio(leafMass: number, waterVolume: number): string {
  if (!leafMass || !waterVolume) return '-';
  const r = waterVolume / leafMass;
  return `1:${r.toFixed(0)}`;
}

function makeDemoRecipes(): CommunityRecipe[] {
  const now = new Date().toISOString();
  const recipes: CommunityRecipe[] = [
    {
      id: 'demo-sencha',
      presetId: 'demo-sencha',
      name: 'Morning Sencha',
      teaType: TeaType.GreenSencha,
      parameters: {
        teaType: TeaType.GreenSencha,
        teaName: 'Morning Sencha',
        vessel: 5,
        boilMethod: 0,
        temperature: 75,
        leafMass: 5,
        waterVolume: 180,
        steepCount: 2,
        tds: 80,
        altitude: 0,
        leafSize: 14,
        steepTimeSec: 60,
      },
      archetypeBadgeId: 'archetype_zephyr',
      upvotes: 124,
      createdAt: now,
    },
    {
      id: 'demo-black',
      presetId: 'demo-black',
      name: 'English Breakfast',
      teaType: TeaType.Black,
      parameters: {
        teaType: TeaType.Black,
        teaName: 'English Breakfast',
        vessel: 5,
        boilMethod: 0,
        temperature: 95,
        leafMass: 4,
        waterVolume: 240,
        steepCount: 1,
        tds: 120,
        altitude: 0,
        leafSize: 16,
        steepTimeSec: 180,
      },
      archetypeBadgeId: 'archetype_golden_drift',
      upvotes: 89,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'demo-oolong',
      presetId: 'demo-oolong',
      name: 'Gongfu Oolong',
      teaType: TeaType.Oolong,
      parameters: {
        teaType: TeaType.Oolong,
        teaName: 'Gongfu Oolong',
        vessel: 6,
        boilMethod: 0,
        temperature: 92,
        leafMass: 7,
        waterVolume: 150,
        steepCount: 5,
        tds: 90,
        altitude: 0,
        leafSize: 18,
        steepTimeSec: 60,
      },
      archetypeBadgeId: 'archetype_golden_drift',
      upvotes: 215,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'demo-puerh',
      presetId: 'demo-puerh',
      name: 'Aged Pu-erh',
      teaType: TeaType.Puerh,
      parameters: {
        teaType: TeaType.Puerh,
        teaName: 'Aged Pu-erh',
        vessel: 1,
        boilMethod: 3,
        temperature: 98,
        leafMass: 8,
        waterVolume: 160,
        steepCount: 6,
        tds: 110,
        altitude: 0,
        leafSize: 20,
        steepTimeSec: 30,
      },
      archetypeBadgeId: 'archetype_obsidian',
      upvotes: 156,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: 'demo-white',
      presetId: 'demo-white',
      name: 'Silver Needle',
      teaType: TeaType.White,
      parameters: {
        teaType: TeaType.White,
        teaName: 'Silver Needle',
        vessel: 5,
        boilMethod: 0,
        temperature: 80,
        leafMass: 4,
        waterVolume: 200,
        steepCount: 3,
        tds: 70,
        altitude: 0,
        leafSize: 15,
        steepTimeSec: 150,
      },
      archetypeBadgeId: 'archetype_blossom',
      upvotes: 73,
      createdAt: new Date(Date.now() - 345600000).toISOString(),
    },
    {
      id: 'demo-yellow',
      presetId: 'demo-yellow',
      name: 'Junshan Yinzhen',
      teaType: TeaType.Yellow,
      parameters: {
        teaType: TeaType.Yellow,
        teaName: 'Junshan Yinzhen',
        vessel: 2,
        boilMethod: 0,
        temperature: 82,
        leafMass: 5,
        waterVolume: 200,
        steepCount: 3,
        tds: 85,
        altitude: 0,
        leafSize: 15,
        steepTimeSec: 120,
      },
      archetypeBadgeId: 'archetype_nova',
      upvotes: 42,
      createdAt: new Date(Date.now() - 432000000).toISOString(),
    },
  ];
  return recipes;
}

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export default function CommunityPage() {
  const [, forceUpdate] = useState(0);
  const [recipes, setRecipes] = useState<CommunityRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>('recent');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const importPreset = usePresetStore((s) => s.importPreset);

  useEffect(() => {
    const unsub = i18n.subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient.get('/community/recipes');
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.recipes ?? [];
        if (!cancelled) {
          setRecipes(data as CommunityRecipe[]);
        }
      } catch {
        if (!cancelled) {
          setRecipes(makeDemoRecipes());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = recipes;
    if (term) {
      list = recipes.filter((r) => {
        const name = r.name.toLowerCase();
        const teaTypeLabel = i18n
          .t(i18n.teaType(r.teaType))
          .toLowerCase();
        const params = r.parameters;
        const paramText = [
          params.temperature,
          params.leafMass,
          params.waterVolume,
          params.steepCount,
          params.tds,
          params.steepTimeSec,
        ]
          .filter((v) => v !== undefined && v !== null)
          .join(' ')
          .toLowerCase();
        return name.includes(term) || teaTypeLabel.includes(term) || paramText.includes(term);
      });
    }

    const sorted = [...list];
    switch (sort) {
      case 'recent':
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'upvoted':
        sorted.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'type':
        sorted.sort(
          (a, b) =>
            a.teaType - b.teaType ||
            b.upvotes - a.upvotes
        );
        break;
    }
    return sorted;
  }, [recipes, search, sort]);

  const handleImport = async (recipe: CommunityRecipe) => {
    const imported: Parameters<typeof importPreset>[0] = {
      id: recipe.id,
      name: recipe.name,
      teaType: recipe.teaType,
      parameters: recipe.parameters as BrewParameters,
      isCommunity: true,
      upvotes: recipe.upvotes,
      createdAt: recipe.createdAt,
      updatedAt: recipe.createdAt,
    };
    await importPreset(imported);
    setToast('Imported to My Presets');
  };

  const handleShare = async (recipe: CommunityRecipe) => {
    const params = recipe.parameters;
    const hash = encodeRecipe({
      teaType: params.teaType,
      teaName: params.teaName || recipe.name,
      vessel: params.vessel,
      boilMethod: params.boilMethod,
      temperature: params.temperature,
      leafMass: params.leafMass,
      waterVolume: params.waterVolume,
      steepCount: params.steepCount,
      tds: params.tds,
      altitude: params.altitude,
      leafSize: params.leafSize,
      steepTimeSec: params.steepTimeSec ?? 120,
    });
    try {
      if (navigator.share) {
        await navigator.share({
          title: `MOBREW Recipe: ${recipe.name}`,
          text: `Check out this tea recipe: ${recipe.name}`,
          url: `${window.location.origin}/community?recipe=${encodeURIComponent(hash)}`,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(hash);
        setToast('Recipe copied to clipboard');
      }
    } catch {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(hash);
        setToast('Recipe copied to clipboard');
      }
    }
  };

  const sortTabs: { key: SortMode; label: string }[] = [
    { key: 'recent', label: i18n.t('communitySortRecent') },
    { key: 'upvoted', label: i18n.t('communitySortUpvoted') },
    { key: 'type', label: i18n.t('communitySortType') },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-glow">
          {i18n.t('communityTitle')}
        </h1>
      </header>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={i18n.t('communitySearch')}
            className="glass-input w-full pl-10 pr-4 py-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-white/10">
        {sortTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSort(tab.key)}
            className={classNames(
              'px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px',
              sort === tab.key
                ? 'text-tea-green border-tea-green'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">{i18n.t('loading')}</div>
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard hover={false} className="text-center py-12">
          <p className="text-slate-400">{i18n.t('communityNoRecipes')}</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe) => {
            const badgeDef = BADGE_DEFINITIONS.find(
              (d) => d.id === recipe.archetypeBadgeId
            );
            const Icon = ICON_MAP[badgeDef?.icon ?? ''] ?? Activity;
            const aura = ARCHETYPE_AURA[recipe.archetypeBadgeId] ?? 'from-slate-400 to-slate-600';
            const params = recipe.parameters;

            return (
              <GlassCard
                key={recipe.id}
                hover={false}
                className="p-0 overflow-hidden flex flex-col"
              >
                <div
                  className={classNames(
                    'relative p-4 bg-gradient-to-r',
                    aura
                  )}
                >
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0">
                      {getTeaIcon(recipe.teaType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white truncate">
                        {recipe.name}
                      </h3>
                      <p className="text-xs text-white/80">
                        {i18n.t(i18n.teaType(recipe.teaType))}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 text-xs font-medium text-white/90 bg-black/20 px-2 py-1 rounded-full">
                        <ArrowUp className="w-3 h-3" />
                        {recipe.upvotes}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                      {params.temperature}°C
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatSteepTime(params.steepTimeSec)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-slate-400" />
                      {formatRatio(params.leafMass, params.waterVolume)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={classNames(
                        'flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r text-white shadow',
                        aura
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="drop-shadow-sm">
                        {badgeDef
                          ? i18n.tRaw(badgeDef.nameKey)
                          : recipe.archetypeBadgeId}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {recipe.upvotes} {i18n.t('communityUpvotes')}
                    </span>
                  </div>
                </div>

                <div className="px-4 pb-4 flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => handleImport(recipe)}
                    className="flex-1 glass-button-primary flex items-center justify-center gap-1.5 text-xs py-2"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {i18n.t('communityImport')}
                  </button>
                  <button
                    onClick={() => handleShare(recipe)}
                    className="glass-button flex items-center justify-center gap-1 text-xs py-2 px-3"
                    aria-label={i18n.t('share')}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="glass-strong rounded-full px-4 py-2 text-sm text-tea-green flex items-center gap-2">
            <Check className="w-4 h-4" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
