import { useEffect, useMemo, useRef, useState } from 'react';
import { Info, FileText } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { i18n } from '@/core/i18n/TranslationManager';
import { calculate } from '@/services/calculationMachine';
import { generateBrewReportPdf } from '@/services/exportService';
import { cn } from '@/lib/utils';
import type { BrewLogEntry } from '@/domain/appTypes';

interface CalcPanelProps {
  log: BrewLogEntry;
  className?: string;
}

function useLocaleUpdate() {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const unsub = i18n.subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);
}

function InfoTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative inline-flex items-center" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ml-1.5 inline-flex items-center justify-center rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
        aria-label={label}
      >
        <Info className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 glass rounded-xl text-xs text-slate-200 shadow-xl">
          {children}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/10" />
        </div>
      )}
    </div>
  );
}

function Gauge({
  value,
  max,
  colorClass,
}: {
  value: number;
  max: number;
  colorClass?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className={cn('h-full transition-all duration-700 rounded-full', colorClass ?? 'bg-tea-green')}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function MetricCard({
  title,
  tooltip,
  children,
  className,
}: {
  title: string;
  tooltip: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('glass rounded-2xl p-5 flex flex-col gap-3', className)}>
      <div className="flex items-center text-sm font-medium text-slate-300">
        {title}
        <InfoTooltip label={i18n.t('calcWhyTooltip')}>{tooltip}</InfoTooltip>
      </div>
      {children}
    </div>
  );
}

export default function CalcPanel({ log, className }: CalcPanelProps) {
  useLocaleUpdate();
  const calc = useMemo(() => calculate(log), [log]);

  const strengthColor: Record<(typeof calc)['strength'], string> = {
    'under-extracted': 'text-yellow-300',
    optimal: 'text-tea-green',
    'over-extracted': 'text-red-300',
  };

  const handleExportPdf = () => {
    const doc = generateBrewReportPdf(log);
    doc.save(`brew-report-${log.id}.pdf`);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-glow">{i18n.t('calcTitle')}</h2>
        <button
          type="button"
          onClick={handleExportPdf}
          className="glass-button flex items-center gap-2 text-xs px-3 py-2"
        >
          <FileText className="w-4 h-4" />
          {i18n.tRaw('calcExportPdf')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          title={i18n.t('calcExtractionYield')}
          tooltip={i18n.tRaw('calcExtractionYieldHint')}
        >
          <div className="flex items-end justify-between">
            <span className="text-2xl font-semibold">
              {calc.extractionYieldPercent.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">
              ideal {calc.idealYieldRange[0]}–{calc.idealYieldRange[1]}%
            </span>
          </div>
          <Gauge
            value={calc.extractionYieldPercent}
            max={Math.max(calc.idealYieldRange[1] + 10, 40)}
            colorClass="bg-tea-green"
          />
        </MetricCard>

        <MetricCard
          title={i18n.t('calcTdsEstimate')}
          tooltip={i18n.tRaw('calcTdsEstimateHint')}
        >
          <div className="flex items-end justify-between">
            <span className="text-2xl font-semibold">
              {calc.tdsMgMl.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">mg/ml</span>
          </div>
          <Gauge value={calc.tdsMgMl} max={5} colorClass="bg-tea-oolong" />
        </MetricCard>

        <MetricCard
          title={i18n.t('calcBalanceScore')}
          tooltip={i18n.tRaw('calcBalanceScoreHint')}
        >
          <div className="flex items-end justify-between">
            <span className={cn('text-2xl font-semibold', calc.balanceScore >= 80 ? 'text-tea-green' : 'text-yellow-300')}>
              {calc.balanceScore.toFixed(0)}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <Gauge value={calc.balanceScore} max={100} colorClass="bg-tea-yellow" />
        </MetricCard>

        <MetricCard
          title={i18n.t('calcStrength')}
          tooltip={i18n.tRaw('calcStrengthHint')}
        >
          <div className="flex items-center justify-between h-full">
            <span className={cn('text-xl font-semibold capitalize', strengthColor[calc.strength])}>
              {i18n.t(
                calc.strength === 'under-extracted'
                  ? 'calcUnderExtracted'
                  : calc.strength === 'over-extracted'
                  ? 'calcOverExtracted'
                  : 'calcOptimal'
              )}
            </span>
            <span className="text-xs text-slate-400 capitalize">{calc.strength}</span>
          </div>
        </MetricCard>
      </div>

      {calc.suggestionKey && (
        <GlassCard hover={false} className="flex items-start gap-3">
          <div className="mt-0.5 w-2 h-2 rounded-full bg-tea-green animate-pulse" />
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
              Suggestion
            </div>
            <div className="font-medium">{i18n.t(calc.suggestionKey)}</div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
