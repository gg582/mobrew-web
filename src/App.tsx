import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrewStore } from '@/stores/brewStore';
import { SimpleModePanel } from '@/components/SimpleModePanel';
import { AdvancedModePanel } from '@/components/AdvancedModePanel';
import { BrewDashboard } from '@/components/BrewDashboard';
import { GlassCard } from '@/components/ui/GlassCard';
import { i18n } from '@/core/i18n/TranslationManager';
import { Leaf, FlaskConical, Sparkles, Globe } from 'lucide-react';

type AppView = 'menu' | 'simple' | 'advanced' | 'brew';

export default function App() {
  const [view, setView] = useState<AppView>('menu');
  const [sourceView, setSourceView] = useState<AppView>('menu');
  const [resetKey, setResetKey] = useState(0);
  const [lang, setLang] = useState(i18n.getLocale());
  const { mode, reset } = useBrewStore();

  const isBrewing = mode === 'brewing' || mode === 'paused' || mode === 'complete' || mode === 'exhausted';

  useEffect(() => {
    const unsub = i18n.subscribe(() => setLang(i18n.getLocale()));
    return unsub;
  }, []);

  useEffect(() => {
    if (!isBrewing && view === 'brew') {
      setResetKey((k) => k + 1);
      setView(sourceView);
    }
  }, [isBrewing, view, sourceView]);

  const handleReset = useCallback(() => {
    reset();
    setResetKey((k) => k + 1);
    setView(sourceView);
  }, [reset, sourceView]);

  return (
    <div className="min-h-screen bg-noise relative">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-2"
          >
            <Leaf className="w-8 h-8 text-tea-green" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-glow">
              {i18n.t('appName')}
            </h1>
          </motion.div>
          <p className="text-slate-400 text-sm md:text-base">{i18n.t('appSubtitle')}</p>

          {/* Language Selector */}
          <div className="flex justify-center gap-2 mt-4">
            {i18n.getAvailableLocales().map((loc) => (
              <button
                key={loc.locale}
                onClick={() => i18n.setLocale(loc.locale)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                  lang === loc.locale
                    ? 'bg-tea-green/20 border-tea-green/40 text-tea-green'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3 h-3 inline mr-1" />
                {loc.displayName}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isBrewing ? (
            <motion.div
              key="brew"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <BrewDashboard />
            </motion.div>
          ) : view === 'menu' ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
            >
              <GlassCard className="cursor-pointer group" onClick={() => setView('simple')}>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-tea-green/10 flex items-center justify-center group-hover:bg-tea-green/20 transition-colors">
                    <Sparkles className="w-8 h-8 text-tea-green" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{i18n.t('simpleModeTitle')}</h3>
                    <p className="text-sm text-slate-400">{i18n.t('simpleModeDesc')}</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="cursor-pointer group" onClick={() => setView('advanced')}>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <FlaskConical className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{i18n.t('advancedModeTitle')}</h3>
                    <p className="text-sm text-slate-400">{i18n.t('advancedModeDesc')}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ) : view === 'simple' ? (
            <motion.div
              key="simple"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SimpleModePanel key={`simple-${resetKey}`} onStart={() => { setSourceView('simple'); setView('brew'); }} />
            </motion.div>
          ) : (
            <motion.div
              key="advanced"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AdvancedModePanel key={`advanced-${resetKey}`} onStart={() => { setSourceView('advanced'); setView('brew'); }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button */}
        {!isBrewing && view !== 'menu' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-8">
            <button onClick={handleReset} className="glass-button text-sm">
              {i18n.t('backToMenu')}
            </button>
          </motion.div>
        )}

        {/* Footer */}
        <footer className="text-center mt-16 text-xs text-slate-600">
          <p>MoBrew · More than a brewer</p>
        </footer>
      </div>
    </div>
  );
}
