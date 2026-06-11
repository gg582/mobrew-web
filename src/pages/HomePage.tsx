import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';
import { usePresetStore } from '@/stores/presetStore';
import { useAuthStore } from '@/stores/authStore';
import { i18n } from '@/core/i18n/TranslationManager';
import type { TranslationKey } from '@/core/i18n/ITranslationStrategy';
import type { LucideIcon } from 'lucide-react';
import { TeaType } from '@/domain/enums';
import {
  Sparkles,
  FlaskConical,
  Thermometer,
  Clock,
  ScrollText,
  Package,
  Bookmark,
  Trophy,
  PenTool,
  Users,
} from 'lucide-react';

function formatSteepTime(seconds?: number) {
  if (!seconds) return '-';
  if (seconds < 60) return `${seconds}s`;
  const min = Math.round(seconds / 60);
  return `${min} min`;
}

function getTeaIcon(teaType: TeaType) {
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

export default function HomePage() {
  const navigate = useNavigate();
  const [, setLocale] = useState(i18n.getLocale());
  const presets = usePresetStore((s) => s.presets);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const unsub = i18n.subscribe(() => setLocale(i18n.getLocale()));
    return unsub;
  }, []);

  const tools = useMemo(
    () => [
      { to: '/brew-log', labelKey: 'navBrewLog', icon: ScrollText },
      { to: '/inventory', labelKey: 'navInventory', icon: Package },
      { to: '/timer', labelKey: 'navTimer', icon: Clock },
      { to: '/presets', labelKey: 'navPresets', icon: Bookmark },
      { to: '/trophy', labelKey: 'navTrophies', icon: Trophy },
      { to: '/curve', labelKey: 'navCurve', icon: PenTool },
      { to: '/community', labelKey: 'navCommunity', icon: Users },
    ] as Array<{ to: string; labelKey: TranslationKey | string; icon: LucideIcon }>,
    []
  );

  return (
    <div className="space-y-8">
      <section className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-semibold text-glow">{i18n.t('appName')}</h2>
        <p className="text-sm sm:text-base text-slate-400">{i18n.t('appSubtitle')}</p>
      </section>

      {!isAuthenticated && (
        <div className="rounded-xl p-4 border border-tea-green/30 bg-tea-green/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <div className="font-semibold text-tea-green">{i18n.t('homeGuestTitle')}</div>
            <div className="text-sm text-slate-300">{i18n.t('homeGuestDesc')}</div>
          </div>
          <Link
            to="/auth"
            className="glass-button-primary whitespace-nowrap text-sm"
          >
            {i18n.t('homeGuestCta')}
          </Link>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard onClick={() => navigate('/simple')} className="group cursor-pointer">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-tea-green/10 flex items-center justify-center group-hover:bg-tea-green/20 transition-colors">
              <Sparkles className="w-7 h-7 text-tea-green" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{i18n.t('simpleModeTitle')}</h3>
              <p className="text-sm text-slate-400">{i18n.t('simpleModeDesc')}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard onClick={() => navigate('/advanced')} className="group cursor-pointer">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <FlaskConical className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{i18n.t('advancedModeTitle')}</h3>
              <p className="text-sm text-slate-400">{i18n.t('advancedModeDesc')}</p>
            </div>
          </div>
        </GlassCard>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3 text-glow">{i18n.t('presetsQuickStart')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map((p) => (
            <GlassCard key={p.id} hover={false} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">
                  {getTeaIcon(p.teaType)}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-slate-400">
                    {i18n.t(i18n.teaType(p.teaType))}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3" />
                  {p.parameters.temperature}°C
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatSteepTime(p.parameters.steepTimeSec)}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3 text-glow">{i18n.t('homeTools')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {tools.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="glass rounded-xl p-4 hover:bg-white/10 transition-colors flex flex-col items-center text-center gap-2"
            >
              <t.icon className="w-6 h-6 text-tea-green" />
              <span className="text-sm font-medium">{i18n.t(t.labelKey)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
