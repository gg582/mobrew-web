import { useMemo } from 'react';
import { i18n } from '@/core/i18n/TranslationManager';
import { GlassCard } from '@/components/ui/GlassCard';
import type { BrewLogEntry } from '@/domain/appTypes';
import { BarChart3, BookOpen, Star, Trophy } from 'lucide-react';

interface BrewLogSummaryProps {
  logs: BrewLogEntry[];
}

export function BrewLogSummary({ logs }: BrewLogSummaryProps) {
  const stats = useMemo(() => {
    const total = logs.length;
    const avgRating =
      total > 0 ? logs.reduce((sum, l) => sum + l.rating, 0) / total : 0;
    const avgBalance =
      total > 0
        ? logs.reduce((sum, l) => sum + l.balanceScore, 0) / total
        : 0;

    const typeCounts = new Map<number, number>();
    logs.forEach((l) => {
      typeCounts.set(l.teaType, (typeCounts.get(l.teaType) ?? 0) + 1);
    });
    let mostBrewedType: number | null = null;
    let maxCount = 0;
    typeCounts.forEach((count, type) => {
      if (count > maxCount) {
        maxCount = count;
        mostBrewedType = type;
      }
    });

    return {
      total,
      avgRating,
      avgBalance,
      mostBrewedType,
      mostBrewedCount: maxCount,
    };
  }, [logs]);

  if (logs.length === 0) return null;

  const items = [
    {
      icon: BookOpen,
      label: i18n.t('brewLogTotalLogs'),
      value: String(stats.total),
    },
    {
      icon: Star,
      label: i18n.t('brewLogAverageRating'),
      value: stats.avgRating.toFixed(1),
    },
    {
      icon: BarChart3,
      label: i18n.t('brewLogAverageBalance'),
      value: stats.avgBalance.toFixed(1),
    },
    {
      icon: Trophy,
      label: i18n.t('brewLogMostBrewed'),
      value:
        stats.mostBrewedType !== null
          ? i18n.t(i18n.teaType(stats.mostBrewedType))
          : '-',
    },
  ];

  return (
    <GlassCard hover={false} className="p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-4">
        <BarChart3 className="w-4 h-4" />
        {i18n.t('brewLogSummaryTitle')}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="glass rounded-xl px-3 py-2.5 min-w-0"
          >
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 mb-1">
              <Icon className="w-3 h-3" />
              <span className="truncate">{label}</span>
            </div>
            <div className="text-base font-semibold text-slate-100 truncate">
              {value}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
