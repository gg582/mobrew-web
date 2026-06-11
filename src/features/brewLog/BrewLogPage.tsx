import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrewLogStore } from '@/stores/brewLogStore';
import { setAdvancedPrefill } from '@/services/advancedPrefill';
import { i18n } from '@/core/i18n/TranslationManager';
import { TeaType } from '@/domain/enums';
import type { BrewLogEntry } from '@/domain/appTypes';
import { exportBrewLogsToCsv } from '@/services/exportService';
import { BrewLogFilter } from './components/BrewLogFilter';
import { BrewLogSummary } from './components/BrewLogSummary';
import { BrewLogCard } from './components/BrewLogCard';
import { BrewLogEmptyState } from './components/BrewLogEmptyState';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FileDown, FileText, ScrollText } from 'lucide-react';

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

function isValidLog(log: unknown): log is BrewLogEntry {
  if (!log || typeof log !== 'object') return false;
  const l = log as Partial<BrewLogEntry>;
  return (
    typeof l.id === 'string' &&
    typeof l.teaName === 'string' &&
    typeof l.teaType === 'number'
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
      .filter(isValidLog)
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

  const handleNoteChange = (id: string, value: string) => {
    setDraftNotes((prev) => ({ ...prev, [id]: value }));
  };

  const handleRatingChange = (id: string, value: number) => {
    setDraftRating((prev) => ({ ...prev, [id]: value }));
  };

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

  const filterProps = {
    teaTypeFilter,
    setTeaTypeFilter,
    minRating,
    setMinRating,
    maxRating,
    setMaxRating,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    keyword,
    setKeyword,
    teaTypes,
  };

  return (
    <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] lg:gap-6 xl:gap-8">
      {/* Left sidebar */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="lg:hidden">
          <BrewLogFilter {...filterProps} collapsible />
        </div>
        <div className="hidden lg:block">
          <BrewLogFilter {...filterProps} />
        </div>
        <div className="hidden lg:block">
          <BrewLogSummary logs={filteredLogs} />
        </div>
      </aside>

      {/* Right content */}
      <div className="space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <ScrollText className="w-7 h-7 text-tea-green shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-semibold text-glow truncate">
              {i18n.t('brewLogTitle')}
            </h1>
          </div>
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

        <div className="lg:hidden">
          <BrewLogSummary logs={filteredLogs} />
        </div>

        {loading && (
          <div className="flex items-center justify-center h-40">
            <div className="text-slate-400">{i18n.t('loading')}</div>
          </div>
        )}

        {!loading && filteredLogs.length === 0 && <BrewLogEmptyState />}

        {!loading && filteredLogs.length > 0 && (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const notesDraft = draftNotes[log.id] ?? log.notes ?? '';
              const ratingDraft = draftRating[log.id] ?? log.rating ?? 0;
              const hasEdits =
                (draftNotes[log.id] !== undefined &&
                  draftNotes[log.id] !== log.notes) ||
                (draftRating[log.id] !== undefined &&
                  draftRating[log.id] !== log.rating);

              return (
                <BrewLogCard
                  key={log.id}
                  log={log}
                  notesDraft={notesDraft}
                  ratingDraft={ratingDraft}
                  hasEdits={hasEdits}
                  onNoteChange={handleNoteChange}
                  onRatingChange={handleRatingChange}
                  onSave={handleSaveEdits}
                  onReuse={handleReuse}
                  onDelete={handleDelete}
                />
              );
            })}
          </div>
        )}
      </div>

      {deleteId && (
        <DeleteConfirmModal
          onCancel={() => setDeleteId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
