import { useState } from 'react';
import { i18n } from '@/core/i18n/TranslationManager';
import { TeaType } from '@/domain/enums';
import { GlassCard } from '@/components/ui/GlassCard';
import { Calendar, Filter, Search, SlidersHorizontal, X } from 'lucide-react';

interface BrewLogFilterProps {
  teaTypeFilter: string;
  setTeaTypeFilter: (v: string) => void;
  minRating: string;
  setMinRating: (v: string) => void;
  maxRating: string;
  setMaxRating: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  keyword: string;
  setKeyword: (v: string) => void;
  teaTypes: TeaType[];
  collapsible?: boolean;
}

export function BrewLogFilter({
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
  collapsible = false,
}: BrewLogFilterProps) {
  const [open, setOpen] = useState(!collapsible);

  const hasActiveFilters =
    teaTypeFilter || minRating || maxRating || dateFrom || dateTo || keyword;

  const handleClear = () => {
    setTeaTypeFilter('');
    setMinRating('');
    setMaxRating('');
    setDateFrom('');
    setDateTo('');
    setKeyword('');
  };

  const filterBody = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {i18n.t('labelTeaType')}
        </label>
        <select
          className="glass-input w-full min-w-0"
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

      <div className="space-y-1.5">
        <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {i18n.t('brewLogFilterRating')}
        </label>
        <div className="flex items-center gap-2 min-w-0">
          <select
            className="glass-input w-full min-w-0"
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
          <span className="text-slate-500 shrink-0">-</span>
          <select
            className="glass-input w-full min-w-0"
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

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          <Calendar className="w-3 h-3" />
          {i18n.t('brewLogFilterDate')}
        </label>
        <div className="flex flex-col gap-2">
          <input
            type="date"
            className="glass-input w-full min-w-0"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            className="glass-input w-full min-w-0"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          <Search className="w-3 h-3" />
          {i18n.t('brewLogSearch')}
        </label>
        <div className="relative">
          <input
            type="text"
            className="glass-input w-full min-w-0 pr-8"
            placeholder={i18n.t('brewLogSearch')}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="w-full glass-button flex items-center justify-center gap-2 text-[11px] py-2"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {i18n.t('brewLogClearFilters')}
        </button>
      )}
    </div>
  );

  if (!collapsible) {
    return (
      <GlassCard hover={false} className="p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-4">
          <Filter className="w-4 h-4" />
          {i18n.t('brewLogFilterType')}
        </div>
        {filterBody}
      </GlassCard>
    );
  }

  return (
    <GlassCard hover={false} className="p-4 sm:p-5 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm font-medium text-slate-300"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {i18n.t('brewLogFilterType')}
          {hasActiveFilters && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-tea-green/20 text-tea-green text-[10px]">
              ON
            </span>
          )}
        </div>
        <SlidersHorizontal className="w-4 h-4 text-slate-400" />
      </button>
      {open && <div className="mt-4">{filterBody}</div>}
    </GlassCard>
  );
}
