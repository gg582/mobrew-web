import { useEffect, useMemo, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { i18n } from '@/core/i18n/TranslationManager';
import { TeaType } from '@/domain/enums';
import type { CustomCurve, CurvePhase } from '@/domain/appTypes';
import { useCurveStore, MAX_CUSTOM_CURVES } from '@/stores/curveStore';
import { totalDuration } from '@/services/curvePlayback';
import { cn } from '@/lib/utils';
import {
  Plus,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  Pencil,
  RotateCcw,
} from 'lucide-react';

const MAX_PHASES = 5;
const START_TEMP = 20;

const teaTypeOptions = (Object.values(TeaType).filter((v) => typeof v === 'number') as TeaType[]);

function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function makeEmptyCurve(): CustomCurve {
  return {
    id: 'draft',
    name: '',
    teaType: TeaType.GreenNormal,
    phases: [
      {
        id: generateId(),
        durationSec: 60,
        targetTemp: 80,
        waterAdditionMl: 0,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

interface GraphPoint {
  x: number;
  y: number;
  time: number;
  temp: number;
}

function buildGraphPoints(
  phases: CurvePhase[],
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number }
): GraphPoint[] {
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const total = totalDuration(phases);
  const maxTemp = Math.max(100, ...phases.map((p) => p.targetTemp), START_TEMP);
  const minTemp = 0;

  const scaleX = (time: number) =>
    padding.left + (total > 0 ? (time / total) * innerWidth : 0);
  const scaleY = (temp: number) =>
    padding.top + innerHeight - ((temp - minTemp) / (maxTemp - minTemp)) * innerHeight;

  const points: GraphPoint[] = [{ x: scaleX(0), y: scaleY(START_TEMP), time: 0, temp: START_TEMP }];
  let cumulative = 0;
  for (const phase of phases) {
    cumulative += phase.durationSec || 0;
    points.push({
      x: scaleX(cumulative),
      y: scaleY(phase.targetTemp),
      time: cumulative,
      temp: phase.targetTemp,
    });
  }
  return points;
}

export default function CurvePage() {
  const [, forceUpdate] = useState(0);
  const curves = useCurveStore((s) => s.curves);
  const saveCurve = useCurveStore((s) => s.saveCurve);
  const updateCurve = useCurveStore((s) => s.updateCurve);
  const deleteCurve = useCurveStore((s) => s.deleteCurve);
  const loadCurves = useCurveStore((s) => s.loadCurves);

  const [draft, setDraft] = useState<CustomCurve>(() => makeEmptyCurve());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = i18n.subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);

  useEffect(() => {
    loadCurves();
  }, [loadCurves]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const totalTime = useMemo(() => totalDuration(draft.phases), [draft.phases]);
  const atPhaseLimit = draft.phases.length >= MAX_PHASES;
  const atCurveLimit = curves.length >= MAX_CUSTOM_CURVES;

  const graphPoints = useMemo(
    () => buildGraphPoints(draft.phases, 800, 320, { top: 24, right: 24, bottom: 48, left: 56 }),
    [draft.phases]
  );

  const polylinePoints = useMemo(
    () => graphPoints.map((p) => `${p.x},${p.y}`).join(' '),
    [graphPoints]
  );

  const handleUpdatePhase = (index: number, field: keyof CurvePhase, value: string | number) => {
    setDraft((prev) => {
      const next = deepClone(prev);
      const phase = next.phases[index];
      if (field === 'durationSec' || field === 'targetTemp' || field === 'waterAdditionMl') {
        const num = typeof value === 'number' ? value : Number(value);
        phase[field] = Number.isNaN(num) ? 0 : num;
      } else {
        (phase[field] as string | number) = value;
      }
      return next;
    });
  };

  const handleAddPhase = () => {
    if (atPhaseLimit) return;
    setDraft((prev) => ({
      ...prev,
      phases: [
        ...prev.phases,
        {
          id: generateId(),
          durationSec: 60,
          targetTemp: prev.phases[prev.phases.length - 1]?.targetTemp ?? 80,
          waterAdditionMl: 0,
        },
      ],
    }));
  };

  const handleRemovePhase = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== index),
    }));
  };

  const handleMovePhase = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= draft.phases.length) return;
    setDraft((prev) => {
      const next = deepClone(prev);
      const temp = next.phases[index];
      next.phases[index] = next.phases[nextIndex];
      next.phases[nextIndex] = temp;
      return next;
    });
  };

  const handleLoadCurve = (curve: CustomCurve) => {
    setDraft(deepClone(curve));
    setEditingId(curve.id);
  };

  const handleNewCurve = () => {
    setDraft(makeEmptyCurve());
    setEditingId(null);
  };

  const handleSave = async () => {
    const name = draft.name.trim();
    if (!name) return;
    if (draft.phases.length === 0) return;
    if (!editingId && atCurveLimit) return;

    const payload = {
      name,
      teaType: draft.teaType,
      phases: draft.phases,
    };

    try {
      if (editingId) {
        await updateCurve(editingId, payload);
      } else {
        await saveCurve(payload);
      }
      setToast(i18n.t('curveSaved'));
      handleNewCurve();
    } catch {
      setToast(i18n.t('errorGeneric'));
    }
  };

  const handleDeleteCurve = async (id: string) => {
    await deleteCurve(id);
    if (editingId === id) {
      handleNewCurve();
    }
    setToast(i18n.t('curveDeleted'));
  };

  const canSave =
    draft.name.trim().length > 0 && draft.phases.length > 0 && (!!editingId || !atCurveLimit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-glow">{i18n.t('curveTitle')}</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleNewCurve} className="glass-button flex items-center gap-2 text-sm">
            <RotateCcw className="w-4 h-4" />
            {i18n.t('curveNew')}
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              'glass-button-primary flex items-center gap-2 text-sm',
              !canSave && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Save className="w-4 h-4" />
            {editingId ? i18n.t('save') : i18n.t('curveSave')}
          </button>
        </div>
      </div>

      {!editingId && atCurveLimit && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {i18n.t('curveSavedLimit')}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-glow">{i18n.t('curveTargetCurve')}</h3>
              <div className="text-xs text-slate-400">
                {i18n.t('curveTotalDuration')}: {totalTime}s
              </div>
            </div>

            {draft.phases.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                {i18n.t('curveAddPhase')}
              </div>
            ) : (
              <svg
                viewBox="0 0 800 320"
                className="w-full h-48 sm:h-64"
                role="img"
                aria-label={i18n.t('curveTargetCurve')}
              >
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(74,222,128,0.35)" />
                    <stop offset="100%" stopColor="rgba(74,222,128,0.05)" />
                  </linearGradient>
                </defs>

                {/* Axes */}
                <line
                  x1={56}
                  y1={272}
                  x2={776}
                  y2={272}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth={1}
                />
                <line
                  x1={56}
                  y1={24}
                  x2={56}
                  y2={272}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth={1}
                />

                {/* Axis labels */}
                <text
                  x={416}
                  y={312}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.6)"
                  fontSize={12}
                >
                  {i18n.t('brewTime')} (s)
                </text>
                <text
                  x={16}
                  y={148}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.6)"
                  fontSize={12}
                  transform="rotate(-90, 16, 148)"
                >
                  {i18n.t('temperature')} (°C)
                </text>

                {/* Polyline */}
                <polyline
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth={3}
                  points={polylinePoints}
                />

                {/* Area under curve */}
                {graphPoints.length > 1 && (
                  <polygon
                    fill="url(#curveGradient)"
                    stroke="none"
                    points={`${graphPoints[0].x},272 ${polylinePoints.replace(/ /g, ' ')} ${graphPoints[graphPoints.length - 1].x},272`}
                  />
                )}

                {/* Points */}
                {graphPoints.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r={5} fill="#0f172a" stroke="#4ade80" strokeWidth={2} />
                    <title>
                      t={p.time}s, T={p.temp}°C
                    </title>
                  </g>
                ))}
              </svg>
            )}
          </GlassCard>

          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-glow">{i18n.t('curvePhases')}</h3>
              <button
                onClick={handleAddPhase}
                disabled={atPhaseLimit}
                className={cn(
                  'glass-button flex items-center gap-2 text-xs',
                  atPhaseLimit && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Plus className="w-4 h-4" />
                {i18n.t('curveAddPhase')}
              </button>
            </div>

            {atPhaseLimit && (
              <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                {i18n.t('curveMaxPhases')}
              </div>
            )}

            <div className="space-y-3">
              {draft.phases.map((phase, idx) => (
                <div
                  key={phase.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-3 rounded-xl border border-white/10 bg-white/5"
                >
                  <div className="sm:col-span-1 text-xs text-slate-400 font-mono">{idx + 1}</div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      {i18n.t('curveDuration')} (s)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={phase.durationSec}
                      onChange={(e) => handleUpdatePhase(idx, 'durationSec', e.target.value)}
                      className="glass-input w-full"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      {i18n.t('curveTemp')} (°C)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={phase.targetTemp}
                      onChange={(e) => handleUpdatePhase(idx, 'targetTemp', e.target.value)}
                      className="glass-input w-full"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      {i18n.t('curveWaterAdd')} (ml)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={phase.waterAdditionMl ?? 0}
                      onChange={(e) => handleUpdatePhase(idx, 'waterAdditionMl', e.target.value)}
                      className="glass-input w-full"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-start sm:justify-end gap-1 pt-1 sm:pt-0">
                    <button
                      onClick={() => handleMovePhase(idx, -1)}
                      disabled={idx === 0}
                      className={cn(
                        'p-2 rounded-lg hover:bg-white/10 text-slate-300',
                        idx === 0 && 'opacity-30 cursor-not-allowed'
                      )}
                      aria-label={i18n.t('prev')}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMovePhase(idx, 1)}
                      disabled={idx === draft.phases.length - 1}
                      className={cn(
                        'p-2 rounded-lg hover:bg-white/10 text-slate-300',
                        idx === draft.phases.length - 1 && 'opacity-30 cursor-not-allowed'
                      )}
                      aria-label={i18n.t('next')}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemovePhase(idx)}
                      className="p-2 rounded-lg hover:bg-white/10 text-red-300"
                      aria-label={i18n.t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard hover={false}>
            <h3 className="text-lg font-medium text-glow mb-4">{i18n.t('edit')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {i18n.t('curveName')}
                </label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={i18n.t('curveName')}
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {i18n.t('labelTeaType')}
                </label>
                <select
                  value={draft.teaType}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      teaType: Number(e.target.value) as TeaType,
                    }))
                  }
                  className="glass-input w-full"
                >
                  {teaTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {i18n.t(i18n.teaType(t))}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-glow">{i18n.t('curveLoad')}</h3>
              <span className="text-xs text-slate-400">
                {curves.length} / {MAX_CUSTOM_CURVES}
              </span>
            </div>

            {curves.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">{i18n.t('curveNoSaved')}</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {curves.map((curve) => (
                  <div
                    key={curve.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border transition-colors',
                      editingId === curve.id
                        ? 'border-tea-green bg-tea-green/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    )}
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{curve.name}</div>
                      <div className="text-xs text-slate-400">
                        {i18n.t(i18n.teaType(curve.teaType))} · {totalDuration(curve.phases)}s ·{' '}
                        {curve.phases.length} {i18n.t('curvePhases').toLowerCase()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handleLoadCurve(curve)}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-300"
                        aria-label={i18n.t('edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCurve(curve.id)}
                        className="p-2 rounded-lg hover:bg-white/10 text-red-300"
                        aria-label={i18n.t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

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
