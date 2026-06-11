import { format } from 'date-fns';
import { i18n } from '@/core/i18n/TranslationManager';
import { GlassCard } from '@/components/ui/GlassCard';
import type { BrewLogEntry } from '@/domain/appTypes';
import {
  Star,
  Trash2,
  Settings,
  Thermometer,
  Clock,
  Scale,
  FlaskConical,
  Droplets,
} from 'lucide-react';

const COMPOSITION_KEYS = [
  { key: 'catechin', label: 'Catechin' },
  { key: 'theanine', label: 'Theanine' },
  { key: 'caffeine', label: 'Caffeine' },
  { key: 'pectin', label: 'Pectin' },
  { key: 'polysaccharide', label: 'Polysaccharide' },
  { key: 'aroma', label: 'Aroma' },
] as const;

function formatSteepTime(sec: number | undefined): string {
  if (sec == null || sec <= 0) return '-';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatRatio(leafGrams: number, waterMl: number): string {
  if (!leafGrams || !waterMl) return '-';
  return `1:${(waterMl / leafGrams).toFixed(1)}`;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`cursor-pointer hover:scale-110 transition-transform ${
            star <= value ? 'text-yellow-400' : 'text-slate-600'
          }`}
        >
          <Star
            className="w-5 h-5"
            fill={star <= value ? 'currentColor' : 'none'}
            strokeWidth={star <= value ? 0 : 1.5}
          />
        </button>
      ))}
    </div>
  );
}

interface BrewLogCardProps {
  log: BrewLogEntry;
  notesDraft: string;
  ratingDraft: number;
  hasEdits: boolean;
  onNoteChange: (id: string, value: string) => void;
  onRatingChange: (id: string, value: number) => void;
  onSave: (log: BrewLogEntry) => void;
  onReuse: (log: BrewLogEntry) => void;
  onDelete: (id: string) => void;
}

const DEFAULT_PARAMS = {
  temperature: 0,
  leafMass: 0,
  waterVolume: 0,
  steepTimeSec: 0,
};

const DEFAULT_COMPOSITION = {
  catechin: 0,
  theanine: 0,
  caffeine: 0,
  pectin: 0,
  polysaccharide: 0,
  aroma: 0,
};

export function BrewLogCard({
  log,
  notesDraft,
  ratingDraft,
  hasEdits,
  onNoteChange,
  onRatingChange,
  onSave,
  onReuse,
  onDelete,
}: BrewLogCardProps) {
  const parameters = { ...DEFAULT_PARAMS, ...log.parameters };
  const composition = { ...DEFAULT_COMPOSITION, ...log.composition };
  const balanceScore = typeof log.balanceScore === 'number' ? log.balanceScore : 0;
  const teaName = log.teaName || 'Unknown Tea';
  const timestamp = typeof log.timestamp === 'number' ? log.timestamp : 0;
  const teaType = typeof log.teaType === 'number' ? log.teaType : 0;

  const params = [
    {
      icon: Thermometer,
      label: i18n.t('labelTemperature'),
      value: `${parameters.temperature}°C`,
    },
    {
      icon: Clock,
      label: i18n.t('brewTime'),
      value: formatSteepTime(parameters.steepTimeSec),
    },
    {
      icon: Scale,
      label: `${i18n.t('labelLeafMass')} / ${i18n.t('labelWaterVolume')}`,
      value: `${parameters.leafMass}g / ${parameters.waterVolume}ml`,
    },
    {
      icon: FlaskConical,
      label: 'Ratio',
      value: formatRatio(parameters.leafMass, parameters.waterVolume),
    },
  ];

  return (
    <GlassCard hover={false} className="p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-100 truncate break-words">
            {teaName}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
            <span className="px-2 py-0.5 rounded-full bg-tea-green/10 text-tea-green border border-tea-green/20">
              {i18n.t(i18n.teaType(teaType))}
            </span>
            <span>{timestamp ? format(timestamp, 'PPP p') : '-'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StarRating
            value={ratingDraft}
            onChange={(v) => onRatingChange(log.id, v)}
          />
          <span className="text-xs text-slate-500">{ratingDraft}/5</span>
        </div>
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {params.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="glass rounded-xl px-2.5 py-2 min-w-0"
          >
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">
              <Icon className="w-3 h-3" />
              <span className="truncate">{label}</span>
            </div>
            <div className="text-sm font-medium text-slate-100 truncate">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Composition */}
      <div>
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
          {i18n.t('brewLogComposition')}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COMPOSITION_KEYS.map(({ key, label }) => {
            const val = composition[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between glass rounded-xl px-2.5 py-2 min-w-0"
              >
                <span className="text-xs text-slate-400 truncate mr-2">
                  {label}
                </span>
                <span className="text-sm font-medium text-slate-100 shrink-0">
                  {typeof val === 'number' ? val.toFixed(2) : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
          {i18n.t('brewLogNotesPlaceholder')}
        </label>
        <textarea
          className="glass-input w-full min-w-0 min-h-[60px] sm:min-h-[80px] resize-y"
          value={notesDraft}
          onChange={(e) => onNoteChange(log.id, e.target.value)}
          placeholder={i18n.t('brewLogNoNotes')}
        />
      </div>

      {/* Balance & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-white/10">
        <div className="glass rounded-xl px-3 py-2 inline-flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">
            Balance
          </span>
          <span className="text-sm font-semibold text-tea-green">
            {balanceScore.toFixed(1)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          {hasEdits && (
            <button
              onClick={() => onSave(log)}
              className="glass-button-primary text-[11px] sm:text-xs px-3 py-1.5"
            >
              {i18n.t('save')}
            </button>
          )}
          <button
            onClick={() => onReuse(log)}
            className="glass-button flex items-center gap-1.5 text-[11px] sm:text-xs px-3 py-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            {i18n.t('brewLogReuseParams')}
          </button>
          <button
            onClick={() => onDelete(log.id)}
            className="ml-auto sm:ml-0 glass-button flex items-center gap-1.5 text-[11px] sm:text-xs px-3 py-1.5 text-red-300 hover:text-red-200"
            style={{
              background:
                'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))',
              borderColor: 'rgba(239,68,68,0.25)',
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {i18n.t('brewLogDelete')}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
