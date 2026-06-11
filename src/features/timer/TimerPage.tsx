import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Thermometer,
  Leaf,
  Volume2,
  VolumeX,
  Check,
} from 'lucide-react';
import { i18n } from '@/core/i18n/TranslationManager';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { TranslationKey } from '@/core/i18n/ITranslationStrategy';

type ChimeType = 'chime1' | 'chime2' | 'chime3' | 'mute';

const CHIMES: ChimeType[] = ['chime1', 'chime2', 'chime3', 'mute'];
const PRESETS = [
  { seconds: 120, labelKey: 'timerPreset2m' as TranslationKey | string },
  { seconds: 180, labelKey: 'timerPreset3m' as TranslationKey | string },
  { seconds: 240, labelKey: 'timerPreset4m' as TranslationKey | string },
  { seconds: 300, labelKey: 'timerPreset5m' as TranslationKey | string },
];

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function playTone(ctx: AudioContext, chime: ChimeType) {
  if (chime === 'mute') return;
  const t = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.4, t);
  master.connect(ctx.destination);

  if (chime === 'chime1') {
    // Bell: clear sine with a soft harmonic
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, t);
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(1, t + 0.02);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
    osc1.connect(g1).connect(master);
    osc1.start(t);
    osc1.stop(t + 1.7);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, t);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.3, t + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    osc2.connect(g2).connect(master);
    osc2.start(t);
    osc2.stop(t + 1.3);
  } else if (chime === 'chime2') {
    // Singing bowl: low sine with long exponential decay
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(196.0, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + 2.6);
  } else if (chime === 'chime3') {
    // Flute: triangle with a quick swell and decay
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880.0, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.8, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + 1.0);
  }
}

export default function TimerPage() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [localeTick, setLocaleTick] = useState(0);
  const [targetSec, setTargetSec] = useState(180);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [remainingSec, setRemainingSec] = useState(180);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [teaName, setTeaName] = useState('');
  const [temp, setTemp] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [customSec, setCustomSec] = useState('');

  const workerRef = useRef<Worker | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const targetSecRef = useRef(targetSec);
  const chimeRef = useRef(settings.timerChime);

  useEffect(() => {
    targetSecRef.current = targetSec;
  }, [targetSec]);

  useEffect(() => {
    chimeRef.current = settings.timerChime;
  }, [settings.timerChime]);

  // Re-render when i18n locale changes
  useEffect(() => {
    const unsubscribe = i18n.subscribe(() => setLocaleTick((n) => n + 1));
    return unsubscribe;
  }, []);

  // Initialize worker once
  useEffect(() => {
    const worker = new Worker('/timer-worker.js');
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<unknown>) => {
      const msg = event.data;
      if (!msg || typeof msg !== 'object' || !('type' in msg)) return;
      const type = (msg as { type: string }).type;

      if (type === 'tick') {
        const data = (msg as unknown) as { elapsedMs: number; remainingSec: number };
        setElapsedMs(data.elapsedMs);
        setRemainingSec(data.remainingSec);
      } else if (type === 'complete') {
        setRunning(false);
        setCompleted(true);
        setRemainingSec(0);
        setElapsedMs(targetSecRef.current * 1000);
        const ctx = audioCtxRef.current;
        const chime = chimeRef.current;
        if (chime !== 'mute') {
          const play = () => {
            if (!ctx) return;
            if (ctx.state === 'suspended') {
              ctx.resume().then(() => playTone(ctx, chime));
            } else {
              playTone(ctx, chime);
            }
          };
          play();
        }
      }
    };

    worker.onerror = (err) => {
      // eslint-disable-next-line no-console
      console.error('Timer worker error:', err);
    };

    worker.postMessage({ type: 'reset', durationSec: targetSec });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureAudio = async () => {
    let ctx = audioCtxRef.current;
    if (!ctx) {
      const AudioContextCls =
        (window as typeof window & { AudioContext?: typeof AudioContext }).AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextCls) {
        ctx = new AudioContextCls();
        audioCtxRef.current = ctx;
      }
    }
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
  };

  const sendReset = (duration: number) => {
    workerRef.current?.postMessage({ type: 'reset', durationSec: duration });
    setElapsedMs(0);
    setRemainingSec(duration);
    setRunning(false);
    setCompleted(false);
  };

  const handleStart = async () => {
    if (completed) {
      sendReset(targetSec);
    }
    await ensureAudio();
    setRunning(true);
    workerRef.current?.postMessage({
      type: 'start',
      durationSec: targetSec,
      elapsedMs: Math.round(elapsedMs),
    });
  };

  const handlePause = () => {
    workerRef.current?.postMessage({ type: 'pause' });
    setRunning(false);
  };

  const handleReset = () => {
    sendReset(targetSec);
  };

  const applyPreset = (seconds: number) => {
    setTargetSec(seconds);
    setShowCustom(false);
    sendReset(seconds);
  };

  const applyCustom = () => {
    const sec = parseInt(customSec, 10);
    if (!Number.isFinite(sec) || sec <= 0) return;
    applyPreset(sec);
    setCustomSec('');
  };

  const handleChimeChange = (value: ChimeType) => {
    updateSettings({ timerChime: value });
  };

  const progressRatio = targetSec > 0 ? remainingSec / targetSec : 0;
  const offset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progressRatio)));

  return (
    <div className="max-w-md mx-auto space-y-6" key={localeTick}>
      <h1 className="text-2xl font-bold text-center text-glow-green flex items-center justify-center gap-2">
        <Clock className="w-6 h-6 text-tea-green" />
        {i18n.t('timerTitle')}
      </h1>

      <section className="glass-card flex flex-col items-center">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
            <circle
              cx="128"
              cy="128"
              r={RADIUS}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="128"
              cy="128"
              r={RADIUS}
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              className="text-tea-green"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className={cn(
                'text-5xl font-mono font-bold tracking-tight text-glow',
                completed && 'text-tea-green'
              )}
            >
              {formatTime(Math.ceil(remainingSec * 1000))}
            </div>
            {teaName ? (
              <div className="mt-2 flex items-center gap-1 text-sm text-slate-300">
                <Leaf className="w-3.5 h-3.5 text-tea-green" />
                <span className="truncate max-w-[10rem]">{teaName}</span>
              </div>
            ) : null}
            {temp ? (
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <Thermometer className="w-3.5 h-3.5" />
                <span>
                  {temp}
                  °C
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="glass-card">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.seconds}
              onClick={() => applyPreset(p.seconds)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium border transition-all',
                targetSec === p.seconds
                  ? 'bg-tea-green/20 border-tea-green/40 text-tea-green'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              )}
            >
              {i18n.t(p.labelKey)}
            </button>
          ))}
          <button
            onClick={() => setShowCustom((s) => !s)}
            className={cn(
              'px-3 py-2 rounded-xl text-sm font-medium border transition-all',
              showCustom
                ? 'bg-tea-green/20 border-tea-green/40 text-tea-green'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
            )}
          >
            {i18n.t('timerPresetCustom')}
          </button>
        </div>

        {showCustom && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <input
              type="number"
              min={1}
              value={customSec}
              onChange={(e) => setCustomSec(e.target.value)}
              placeholder="Seconds"
              className="glass-input w-28 text-center"
            />
            <button
              onClick={applyCustom}
              className="glass-button-primary text-xs px-3 py-2 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              {i18n.t('apply')}
            </button>
          </div>
        )}
      </section>

      <section className="glass-card space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            {i18n.t('timerTeaLabel')}
          </label>
          <input
            type="text"
            value={teaName}
            onChange={(e) => setTeaName(e.target.value)}
            placeholder={i18n.t('timerTeaLabel')}
            className="glass-input w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            {i18n.t('timerTemperatureRef')}
          </label>
          <input
            type="number"
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
            placeholder="e.g. 85"
            className="glass-input w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            {i18n.t('timerChime')}
          </label>
          <div className="flex flex-wrap gap-2">
            {CHIMES.map((c) => {
              const active = settings.timerChime === c;
              const labelKey: TranslationKey | string =
                c === 'mute' ? 'timerMute' : (`timerChime${c.replace('chime', '')}` as TranslationKey);
              return (
                <button
                  key={c}
                  onClick={() => handleChimeChange(c)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all',
                    active
                      ? 'bg-tea-green/20 border-tea-green/40 text-tea-green'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {c === 'mute' ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                  {i18n.t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center gap-3">
        {!running ? (
          <button onClick={handleStart} className="glass-button-primary flex items-center gap-2">
            <Play className="w-4 h-4" />
            {i18n.t('timerStart')}
          </button>
        ) : (
          <button onClick={handlePause} className="glass-button flex items-center gap-2">
            <Pause className="w-4 h-4" />
            {i18n.t('timerPause')}
          </button>
        )}
        <button onClick={handleReset} className="glass-button flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          {i18n.t('timerReset')}
        </button>
      </section>

      {completed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-strong rounded-2xl p-8 max-w-sm w-full text-center space-y-5">
            <div className="mx-auto w-16 h-16 rounded-full bg-tea-green/20 flex items-center justify-center">
              <Clock className="w-8 h-8 text-tea-green" />
            </div>
            <h2 className="text-2xl font-bold text-glow-green">{i18n.t('timerComplete')}</h2>
            {teaName ? (
              <p className="text-slate-300 text-sm">
                {teaName} {i18n.t('timerComplete').toLowerCase()}
              </p>
            ) : null}
            <button
              onClick={() => {
                sendReset(targetSec);
              }}
              className="glass-button-primary w-full"
            >
              {i18n.t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
