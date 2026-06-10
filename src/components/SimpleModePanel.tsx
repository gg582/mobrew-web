import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrewStore } from '@/stores/brewStore';
import { BrewingRegion } from '@/domain/enums';
import { GlassCard } from './ui/GlassCard';
import {
  getRecommendation,
  TASTE_OPTIONS,
  MOOD_OPTIONS,
  CAFFEINE_OPTIONS,
  type TasteProfile,
  type MoodGoal,
  type CaffeinePref,
} from '@/data/recommendations';
import { i18n } from '@/core/i18n/TranslationManager';
import { Sparkles, RotateCcw, ChevronRight } from 'lucide-react';

interface SimpleModePanelProps {
  onStart: () => void;
}

type Step = 'taste' | 'mood' | 'caffeine' | 'result';

export function SimpleModePanel({ onStart }: SimpleModePanelProps) {
  const { startEasyMode, beginBrewing } = useBrewStore();
  const [, forceUpdate] = useState(0);
  const [step, setStep] = useState<Step>('taste');
  const [taste, setTaste] = useState<TasteProfile | null>(null);
  const [mood, setMood] = useState<MoodGoal | null>(null);
  const [caffeine, setCaffeine] = useState<CaffeinePref | null>(null);

  useEffect(() => {
    const unsub = i18n.subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);

  const recommendation = taste && mood && caffeine
    ? getRecommendation(taste, mood, caffeine)
    : null;

  const handleRestart = () => {
    setStep('taste');
    setTaste(null);
    setMood(null);
    setCaffeine(null);
  };

  const handleStart = () => {
    if (!recommendation) return;
    startEasyMode(recommendation.region, recommendation.teaType);
    beginBrewing();
    onStart();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-glow">{i18n.t('simpleModeTitle')}</h2>
        <p className="text-sm text-slate-400">{i18n.t('simpleModeDesc')}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {(['taste', 'mood', 'caffeine'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                (step === s || (step === 'result' && i < 3))
                  ? 'bg-tea-green text-slate-900'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && <div className="w-8 h-px bg-slate-600" />}
          </div>
        ))}
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === 'taste' && (
          <motion.div
            key="taste"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-center">{i18n.t('simpleQuestionTaste')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TASTE_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setTaste(opt.value); setStep('mood'); }}
                  className="glass-card text-left cursor-pointer hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.emoji}</span>
                    <div>
                      <div className="font-medium">{i18n.t(opt.labelKey as any)}</div>
                      <div className="text-xs text-slate-400">{i18n.t(opt.descKey as any)}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'mood' && (
          <motion.div
            key="mood"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-center">{i18n.t('simpleQuestionMood')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOOD_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setMood(opt.value); setStep('caffeine'); }}
                  className="glass-card text-left cursor-pointer hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.emoji}</span>
                    <div className="font-medium">{i18n.t(opt.labelKey as any)}</div>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="text-center">
              <button onClick={() => setStep('taste')} className="text-xs text-slate-500 hover:text-slate-300">
                ← {i18n.t('prev')}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'caffeine' && (
          <motion.div
            key="caffeine"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-center">{i18n.t('simpleQuestionCaffeine')}</h3>
            <div className="space-y-3">
              {CAFFEINE_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => { setCaffeine(opt.value); setStep('result'); }}
                  className="glass-card w-full text-left cursor-pointer hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.emoji}</span>
                    <div className="font-medium">{i18n.t(opt.labelKey as any)}</div>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="text-center">
              <button onClick={() => setStep('mood')} className="text-xs text-slate-500 hover:text-slate-300">
                ← {i18n.t('prev')}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'result' && recommendation && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="text-center">
              <div className="text-sm text-tea-green font-medium mb-1">{i18n.t('simpleResultTitle')}</div>
              <h3 className="text-3xl font-bold text-glow mb-2">{recommendation.name}</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {recommendation.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-slate-300">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <GlassCard hover={false} className="bg-white/5">
              <p className="text-sm text-slate-300 leading-relaxed text-center">
                {i18n.tRaw(recommendation.reasonKey)}
              </p>
            </GlassCard>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <GlassCard hover={false} className="text-center p-4">
                <div className="text-xs text-slate-400 uppercase tracking-wider">{i18n.t('simpleResultOrigin')}</div>
                <div className="text-sm font-semibold mt-1">{i18n.t(i18n.region(recommendation.region))}</div>
              </GlassCard>
              <GlassCard hover={false} className="text-center p-4">
                <div className="text-xs text-slate-400 uppercase tracking-wider">{i18n.t('simpleResultVessel')}</div>
                <div className="text-sm font-semibold mt-1">{i18n.t(i18n.vessel(recommendation.region === BrewingRegion.EastAsia ? 6 : recommendation.region === BrewingRegion.British ? 0 : recommendation.region === BrewingRegion.SoutheastAsia ? 1 : recommendation.region === BrewingRegion.Tibetan ? 4 : 5))}</div>
              </GlassCard>
              <GlassCard hover={false} className="text-center p-4">
                <div className="text-xs text-slate-400 uppercase tracking-wider">{i18n.t('simpleResultTemp')}</div>
                <div className="text-sm font-semibold mt-1">{recommendation.tempHint}</div>
              </GlassCard>
              <GlassCard hover={false} className="text-center p-4">
                <div className="text-xs text-slate-400 uppercase tracking-wider">{i18n.t('simpleResultTime')}</div>
                <div className="text-sm font-semibold mt-1">{recommendation.brewTimeHint}</div>
              </GlassCard>
            </div>

            <div className="flex justify-center gap-3">
              <button onClick={handleRestart} className="glass-button flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> {i18n.t('simpleRestartButton')}
              </button>
              <button onClick={handleStart} className="glass-button-primary flex items-center gap-2 px-8">
                <Sparkles className="w-5 h-5" />
                {i18n.t('simpleStartButton')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
