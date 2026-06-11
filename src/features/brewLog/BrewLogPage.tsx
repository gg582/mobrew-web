import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useBrewLogStore } from '@/stores/brewLogStore';
import { setAdvancedPrefill } from '@/services/advancedPrefill';
import { i18n } from '@/core/i18n/TranslationManager';
import { GlassCard } from '@/components/ui/GlassCard';
import { TeaType } from '@/domain/enums';
import type { BrewLogEntry } from '@/domain/appTypes';
import { exportBrewLogsToCsv } from '@/services/exportService';
import {
  Star,
  Trash2,
  FileDown,
  FileText,
  Settings,
  Search,
  Calendar,
  Filter,
} from 'lucide-react';

function toStartOfDayTimestamp(dateStr: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

function toEndOfDayTimestamp(dateStr: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

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

const COMPOSITION_KEYS = [
  { key: 'catechin', label: 'Catechin' },
  { key: 'theanine', label: 'Theanine' },
  { key: 'caffeine', label: 'Caffeine' },
  { key: 'pectin', label: 'Pectin' },
  { key: 'polysaccharide', label: 'Polysaccharide' },
  { key: 'aroma', label: 'Aroma' },
] as const;

function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`${
            readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } transition-transform ${star <= value ? 'text-yellow-400' : 'text-slate-600'}`}
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

export default function BrewLogPage() {
  const navigate = useNavigate();
  const [, forceUpdate] = useState(0);
  const { logs, loading, loadLogs, updateLog, deleteLog } = useBrewLogStore();

  const [teaTypeFilter, setTeaTypeFilter] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');
  const [maxRating, setMaxRating] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [keyword, setKeyword] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [draftRating, setDraftRating] = useState<Record<string, number>>({});

  useEffect(() => {
    const unsub = i18n.subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    const filters = {
      teaType: teaTypeFilter === '' ? null : Number(teaTypeFilter),
      from: toStartOfDayTimestamp(dateFrom),
      to: toEndOfDayTimestamp(dateTo),
      minRating: minRating === '' ? null : Number(minRating),
    };
    useBrewLogStore.getState().setFilters(filters);
  }, [teaTypeFilter, minRating, dateFrom, dateTo]);

  const teaTypes = useMemo(
    () => Object.values(TeaType).filter((v) => typeof v === 'number') as TeaType[],
    []
  );

  const filteredLogs = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const teaTypeNum = teaTypeFilter === '' ? null : Number(teaTypeFilter);
    const min = minRating === '' ? 1 : Number(minRating);
    const max = maxRating === '' ? 5 : Number(maxRating);
    const fromTs = toStartOfDayTimestamp(dateFrom);
    const toTs = toEndOfDayTimestamp(dateTo);

    return [...logs]
      .sort((a, b) => b.timestamp - a.timestamp)
      .filter((log) => {
        if (teaTypeNum !== null && log.teaType !== teaTypeNum) return false;
        if (log.rating < min || log.rating > max) return false;
        if (fromTs !== null && log.timestamp < fromTs) return false;
        if (toTs !== null && log.timestamp > toTs) return false;
        if (k) {
          const inName = log.teaName.toLowerCase().includes(k);
          const inNotes = (log.notes ?? '').toLowerCase().includes(k);
          if (!inName && !inNotes) return false;
        }
        return true;
      });
  }, [logs, keyword, teaTypeFilter, minRating, maxRating, dateFrom, dateTo]);

  const handleSaveEdits = async (log: BrewLogEntry) => {
    const notes = draftNotes[log.id] ?? log.notes;
    const rating = draftRating[log.id] ?? log.rating;
    await updateLog(log.id, { notes, rating });
    setDraftNotes((prev) => {
      const next = { ...prev };
      delete next[log.id];
      return next;
    });
    setDraftRating((prev) => {
      const next = { ...prev };
      delete next[log.id];
      return next;
    });
  };

  const handleReuse = (log: BrewLogEntry) => {
    setAdvancedPrefill({
      ...log.parameters,
      teaName: log.teaName,
      steepTimeSec: log.parameters.steepTimeSec ?? 0,
    });
    navigate('/advanced');
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteLog(deleteId);
    setDeleteId(null);
  };

  const handleExportCsv = () => {
    const blob = exportBrewLogsToCsv(filteredLogs);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mobrew-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (filteredLogs.length === 0) return;
    import('@/services/exportService').then(({ generateBrewReportPdf }) => {
      const doc = generateBrewReportPdf(filteredLogs[0]);
      doc.save(`mobrew-report-${filteredLogs[0].teaName}-${Date.now()}.pdf`);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-glow">
          {i18n.t('brewLogTitle')}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="glass-button flex items-center gap-2 text-xs px-3 py-2"
          >
            <FileDown className="w-4 h-4" />
            {i18n.t('brewLogExportCsv')}
          </button>
          <button
            onClick={handleExportPdf}
            className="glass-button flex items-center gap-2 text-xs px-3 py-2"
          >
            <FileText className="w-4 h-4" />
            {i18n.t('brewLogExportPdf')}
          </button>
        </div>
      </div>

      <GlassCard hover={false} className="space-y-3 p-4 sm:p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Filter className="w-4 h-4" />
          {i18n.t('brewLogFilterType')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="block text-xs text-slate-400 uppercase tracking-wider">
              {i18n.t('labelTeaType')}
            </label>
            <select
              className="glass-input w-full"
              value={teaTypeFilter}
              onChange={(e) => setTeaTypeFilter(e.target.value)}
            >
              <option value="">{i18n.t('brewLogFilterAll')}</option>
              {teaTypes.map((t) => (
                <option key={t} value={t}>
                  {i18n.t(i18n.teaType(t))}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-slate-400 uppercase tracking-wider">
              {i18n.t('brewLogFilterRating')}
            </label>
            <div className="flex items-center gap-2">
              <select
                className="glass-input w-full"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="">Min</option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={`min-${r}`} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <span className="text-slate-500">-</span>
              <select
                className="glass-input w-full"
                value={maxRating}
                onChange={(e) => setMaxRating(e.target.value)}
              >
                <option value="">Max</option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={`max-${r}`} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1 text-xs text-slate-400 uppercase tracking-wider">
              <Calendar className="w-3 h-3" />
              {i18n.t('brewLogFilterDate')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="glass-input w-full"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-slate-500">-</span>
              <input
                type="date"
                className="glass-input w-full"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1 text-xs text-slate-400 uppercase tracking-wider">
              <Search className="w-3 h-3" />
              {i18n.t('brewLogSearch')}
            </label>
            <div className="relative">
              <input
                type="text"
                className="glass-input w-full pr-8"
                placeholder={i18n.t('brewLogSearch')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="text-slate-400">{i18n.t('loading')}</div>
        </div>
      )}

      {!loading && filteredLogs.length === 0 && (
        <GlassCard hover={false} className="text-center py-12">
          <p className="text-slate-400">{i18n.t('brewLogEmpty')}</p>
        </GlassCard>
      )}

      <div className="space-y-4">
        {!loading &&
          filteredLogs.map((log) => {
            const notesDraft = draftNotes[log.id] ?? log.notes ?? '';
            const ratingDraft = draftRating[log.id] ?? log.rating ?? 0;
            const hasEdits =
              (draftNotes[log.id] !== undefined && draftNotes[log.id] !== log.notes) ||
              (draftRating[log.id] !== undefined && draftRating[log.id] !== log.rating);

            return (
              <GlassCard key={log.id} hover={false} className="space-y-3 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">{log.teaName}</h3>
                    <div className="text-xs text-slate-400">
                      {format(log.timestamp, 'PPP p')}
                    </div>
                    <div className="text-sm text-tea-green">
                      {i18n.t(i18n.teaType(log.teaType))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating
                      value={ratingDraft}
                      onChange={(v) =>
                        setDraftRating((prev) => ({ ...prev, [log.id]: v }))
                      }
                    />
                    <span className="text-xs text-slate-500">
                      {ratingDraft}/5
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="glass rounded-lg px-2 py-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">
                      {i18n.t('labelTemperature')}
                    </div>
                    <div className="text-sm font-medium">
                      {log.parameters.temperature}°C
                    </div>
                  </div>
                  <div className="glass rounded-lg px-2 py-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">
                      {i18n.t('brewTime')}
                    </div>
                    <div className="text-sm font-medium">
                      {formatSteepTime(log.parameters.steepTimeSec)}
                    </div>
                  </div>
                  <div className="glass rounded-lg px-2 py-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">
                      {i18n.t('labelLeafMass')} / {i18n.t('labelWaterVolume')}
                    </div>
                    <div className="text-sm font-medium">
                      {log.parameters.leafMass}g / {log.parameters.waterVolume}ml
                    </div>
                  </div>
                  <div className="glass rounded-lg px-2 py-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">
                      Ratio
                    </div>
                    <div className="text-sm font-medium">
                      {formatRatio(log.parameters.leafMass, log.parameters.waterVolume)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
                    {i18n.t('brewLogNotesPlaceholder')}
                  </label>
                  <textarea
                    className="glass-input w-full min-h-[60px] sm:min-h-[80px] resize-y"
                    value={notesDraft}
                    onChange={(e) =>
                      setDraftNotes((prev) => ({ ...prev, [log.id]: e.target.value }))
                    }
                    placeholder={i18n.t('brewLogNotesPlaceholder')}
                  />
                </div>

                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                    {i18n.t('brewLogComposition')}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COMPOSITION_KEYS.map(({ key, label }) => {
                      const val = log.composition[key];
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between glass rounded-lg px-2 py-1.5"
                        >
                          <span className="text-xs text-slate-400">{label}</span>
                          <span className="text-sm font-medium">
                            {typeof val === 'number' ? val.toFixed(2) : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="glass rounded-lg px-2 py-1.5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider mr-2">
                      Balance Score
                    </span>
                    <span className="text-sm font-semibold text-tea-green">
                      {log.balanceScore.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                  {hasEdits && (
                    <button
                      onClick={() => handleSaveEdits(log)}
                      className="glass-button-primary text-[11px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2"
                    >
                      {i18n.t('save')}
                    </button>
                  )}
                  <button
                    onClick={() => handleReuse(log)}
                    className="glass-button flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2"
                  >
                    <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {i18n.t('brewLogReuseParams')}
                  </button>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="ml-auto glass-button flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 text-red-300 hover:text-red-200"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))',
                      borderColor: 'rgba(239,68,68,0.25)',
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    {i18n.t('brewLogDelete')}
                  </button>
                </div>
              </GlassCard>
            );
          })}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDeleteId(null)}
          />
          <GlassCard className="relative z-10 w-full max-w-sm text-center space-y-4">
            <h3 className="text-lg font-semibold">
              {i18n.t('confirm')} {i18n.t('delete').toLowerCase()}
            </h3>
            <p className="text-sm text-slate-400">
              Are you sure you want to delete this brew log? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="glass-button text-xs px-4 py-2"
              >
                {i18n.t('cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="glass-button text-xs px-4 py-2 text-red-300"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.1))',
                  borderColor: 'rgba(239,68,68,0.3)',
                }}
              >
                {i18n.t('delete')}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
