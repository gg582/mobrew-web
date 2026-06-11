import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrewStore } from '@/stores/brewStore';
import { i18n } from '@/core/i18n/TranslationManager';
import { Percentage } from '@/domain/models/Percentage';
import { GlassCard } from './ui/GlassCard';
import { LeafVisualizer } from './LeafVisualizer';
import { LeachingBox } from './LeachingBox';
import { formatNumber } from '@/lib/utils';
import PostBrewPanel from '@/features/calc/PostBrewPanel';
import {
  Thermometer, Droplets, Gauge, Activity,
  Flower2, Coffee, AlertCircle, Wind, Sparkles,
  ChevronRight, Pause, Play, RotateCcw, BarChart3,
  ArrowRight
} from 'lucide-react';

export function BrewDashboard() {
  const { mode, snapshot, history, pauseBrewing, resumeBrewing, stopBrewing, nextInfusion, toggleStats } = useBrewStore();
  const [, forceUpdate] = useState(0);
  const [showNextForm, setShowNextForm] = useState(false);
  const [nextTemp, setNextTemp] = useState('');
  const [nextVol, setNextVol] = useState('');

  useEffect(() => {
    const unsub = i18n.subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);

  if (!snapshot) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">Initializing simulation...</div>
      </div>
    );
  }

  const progress = Math.min(100, snapshot.cycleExtractionPercent);
  const isComplete = mode === 'complete';
  const isExhausted = snapshot.isExhausted;
  const canNext = isComplete && snapshot.currentInfusion < snapshot.numInfusions && !isExhausted;

  const handleNextConfirm = () => {
    const t = nextTemp ? Number(nextTemp) : snapshot.temperature.toCelsius();
    const v = nextVol ? Number(nextVol) : 120;
    nextInfusion(t, v);
    setShowNextForm(false);
    setNextTemp('');
    setNextVol('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold text-glow">
            {i18n.t('infusionCounter')} {snapshot.currentInfusion} / {snapshot.numInfusions}
          </div>
          {snapshot.cycleActive ? (
            <span className="px-2 py-0.5 rounded-full bg-tea-green/20 text-tea-green text-xs font-medium animate-pulse">{i18n.t('brewing')}</span>
          ) : isComplete ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">{i18n.t('complete')}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <div className="font-mono text-xl text-glow-green">{snapshot.formattedTime}</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left */}
        <div className="space-y-4">
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-slate-400"><Thermometer className="w-4 h-4" />{i18n.t('temperature')}</div>
              <span className="text-sm font-mono">{formatNumber(snapshot.temperature.toCelsius(), 1)}°</span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-blue-500 to-red-500" animate={{ width: `${Math.min(100, (snapshot.temperature.toCelsius() / 100) * 100)}%` }} />
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-slate-400"><Gauge className="w-4 h-4" />{i18n.t('extraction')}</div>
              <span className="text-sm font-mono">{snapshot.cycleExtractionPercent.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-tea-green to-emerald-300" animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2"><Activity className="w-4 h-4" />{i18n.t('saturation')}</div>
            <div className="text-2xl font-mono">{Percentage.fromRatio(snapshot.saturationIndex).formatted(1)}</div>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2"><Droplets className="w-4 h-4" />{i18n.t('hydration')}</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div className="h-full bg-cyan-400" animate={{ width: `${snapshot.hydrationPercent}%` }} />
              </div>
              <span className="text-xs font-mono w-10 text-right">{Percentage.fromRatio(snapshot.hydrationState).formatted(0)}</span>
            </div>
          </GlassCard>
        </div>

        {/* Center */}
        <div className="space-y-4">
          <GlassCard hover={false} className="h-48 flex items-center justify-center">
            <LeafVisualizer unfurling={snapshot.unfurlingState} />
          </GlassCard>
          <GlassCard hover={false}>
            <LeachingBox level={snapshot.cycleExtractionPercent} velocity={snapshot.extVelocity / 100} />
          </GlassCard>
          <div className="grid grid-cols-2 gap-3">
            <GlassCard hover={false} className="p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1"><Wind className="w-3 h-3" />{i18n.t('aromaFlux')}</div>
              <div className="text-xs font-mono space-y-0.5">
                <div className="text-emerald-400">+{formatNumber(snapshot.aromaExtractionAxis, 2)}</div>
                <div className="text-rose-400">-{formatNumber(snapshot.aromaVolatilityAxis, 2)}</div>
              </div>
            </GlassCard>
            <GlassCard hover={false} className="p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1"><Sparkles className="w-3 h-3" />{i18n.t('aminoAxes')}</div>
              <div className="text-xs font-mono space-y-0.5">
                <div>Body {(snapshot.aminoDepthAxis * 100).toFixed(0)}%</div>
                <div>Flow {formatNumber(snapshot.aminoVibrancyAxis, 2)}</div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-3">
          <GlassCard hover={false}>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Coffee className="w-4 h-4" />{i18n.t('composition')}</div>
            <div className="space-y-2">
              <MetricRow label="Catechin" value={snapshot.components.catechin} color="text-yellow-400" />
              <MetricRow label="Theanine" value={snapshot.components.aminoAcid} color="text-tea-green" />
              <MetricRow label="Caffeine" value={snapshot.components.caffeine} color="text-amber-400" />
              <MetricRow label="Pectin" value={snapshot.components.pectin} color="text-orange-400" />
              <MetricRow label="Polysaccharide" value={snapshot.components.polysaccharide} color="text-blue-400" />
              <MetricRow label="Aroma" value={snapshot.components.aroma} color="text-pink-400" />
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">{i18n.t('clarityIndex')}</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">{formatNumber(snapshot.clarityIndex, 2)} mg/ml</span>
              {snapshot.clarityIndex > 1.3 && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">High</span>}
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">{i18n.t('teaDistributor')}</div>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between"><span className="text-slate-500">{i18n.t('potential')}</span><span>{formatNumber(snapshot.distributorPotential, 1)} mg/ml</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{i18n.t('targetShare')}</span><span>{Percentage.fromPercent(snapshot.distributorTargetHint).formatted(1)}</span></div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Warnings */}
      <AnimatePresence>
        {snapshot.astringencyRate > 0.5 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass rounded-xl p-3 border border-red-500/30 bg-red-500/10 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-300">{i18n.t('warningBitter')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isComplete && !isExhausted && snapshot.currentInfusion >= snapshot.numInfusions && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass rounded-xl p-3 border border-amber-500/30 bg-amber-500/10 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-amber-300">{i18n.t('warningMaxInfusions')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExhausted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <Flower2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-slate-300">{i18n.t('leafExhausted')}</h3>
            <p className="text-sm text-slate-500 mt-1">{i18n.t('leafExhaustedDesc')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-brew actions */}
      <AnimatePresence>
        {(isComplete || isExhausted) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <PostBrewPanel onReset={stopBrewing} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
        {snapshot.cycleActive ? (
          <button onClick={pauseBrewing} className="glass-button flex items-center gap-2"><Pause className="w-4 h-4" /> {i18n.t('pause')}</button>
        ) : mode === 'paused' ? (
          <button onClick={resumeBrewing} className="glass-button-primary flex items-center gap-2"><Play className="w-4 h-4" /> {i18n.t('resume')}</button>
        ) : null}

        {canNext && !showNextForm && (
          <button onClick={() => setShowNextForm(true)} className="glass-button-primary flex items-center gap-2">{i18n.t('nextInfusion')} <ArrowRight className="w-4 h-4" /></button>
        )}

        <button onClick={toggleStats} className="glass-button flex items-center gap-2"><BarChart3 className="w-4 h-4" /> {i18n.t('stats')}</button>
        <button onClick={stopBrewing} className="glass-button flex items-center gap-2 text-rose-400 border-rose-500/20"><RotateCcw className="w-4 h-4" /> {i18n.t('reset')}</button>
      </div>

      {/* Next Infusion Form */}
      <AnimatePresence>
        {showNextForm && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="glass-strong rounded-2xl p-4 sm:p-6 max-w-md mx-auto space-y-4">
            <h4 className="text-lg font-semibold text-center">{i18n.t('prepareNextInfusion')}</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">{i18n.t('nextInfusionTemp')}</label>
                <input type="number" className="glass-input w-full" placeholder={`Current: ${formatNumber(snapshot.temperature.toCelsius(), 1)}`} value={nextTemp} onChange={(e) => setNextTemp(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">{i18n.t('nextInfusionVolume')}</label>
                <input type="number" className="glass-input w-full" placeholder="120" value={nextVol} onChange={(e) => setNextVol(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowNextForm(false)} className="glass-button text-sm">{i18n.t('cancel')}</button>
              <button onClick={handleNextConfirm} className="glass-button-primary flex items-center gap-2 text-sm">{i18n.t('next')} <ChevronRight className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      <AnimatePresence>
        {useBrewStore.getState().showStats && history.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <GlassCard hover={false}>
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">{i18n.t('sessionHistory')}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {history.map((h, i) => (
                  <div key={i} className="bg-slate-800/40 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-slate-500">{i18n.t('infusionCounter')} {i + 1}</div>
                    <div className="text-sm font-mono">{h.formattedTime}</div>
                    <div className="text-xs text-slate-400">{h.extractionLevel.formatted(1)}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-xs font-mono ${color}`}>{formatNumber(value, 2)} mg</span>
    </div>
  );
}
