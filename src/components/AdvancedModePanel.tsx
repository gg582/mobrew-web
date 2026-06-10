import { useState, useEffect } from 'react';
import { useBrewStore } from '@/stores/brewStore';
import { TeaType, VesselType, BoilMethod, UnitSystem } from '@/domain/enums';
import { i18n } from '@/core/i18n/TranslationManager';
import { GlassCard } from './ui/GlassCard';
import { Settings, ChevronRight } from 'lucide-react';

interface AdvancedModePanelProps {
  onStart: () => void;
}

export function AdvancedModePanel({ onStart }: AdvancedModePanelProps) {
  const { startExpertMode, beginBrewing } = useBrewStore();
  const [, forceUpdate] = useState(0);
  const [config, setConfig] = useState({
    teaType: TeaType.GreenNormal,
    vessel: VesselType.Glass,
    currentTemp: 85,
    leafMass: 5,
    waterVolumeMl: 200,
    numInfusions: 3,
    tds: 100,
    altitudeM: 0,
    leafWidth: 6,
    leafHeight: 15,
    boilMethod: BoilMethod.Electric,
    unitSystem: UnitSystem.Metric,
    useFahrenheit: false,
    hasButter: false,
    boilingInPot: false,
    heatLevel: 0,
  });

  useEffect(() => {
    const unsub = i18n.subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);

  const handleStart = () => {
    startExpertMode(config);
    beginBrewing();
    onStart();
  };

  const teaTypes = Object.values(TeaType).filter((v) => typeof v === 'number') as TeaType[];
  const vessels = Object.values(VesselType).filter((v) => typeof v === 'number') as VesselType[];
  const boilMethods = Object.values(BoilMethod).filter((v) => typeof v === 'number') as BoilMethod[];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-glow">{i18n.t('advancedTitle')}</h2>
        <p className="text-sm text-slate-400">{i18n.t('advancedSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard hover={false}>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">{i18n.t('labelTeaType')}</label>
          <select
            className="glass-input w-full"
            value={config.teaType}
            onChange={(e) => setConfig({ ...config, teaType: Number(e.target.value) })}
          >
            {teaTypes.map((t) => (
              <option key={t} value={t}>{i18n.t(i18n.teaType(t))}</option>
            ))}
          </select>
        </GlassCard>

        <GlassCard hover={false}>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">{i18n.t('labelVessel')}</label>
          <select
            className="glass-input w-full"
            value={config.vessel}
            onChange={(e) => setConfig({ ...config, vessel: Number(e.target.value) })}
          >
            {vessels.map((v) => (
              <option key={v} value={v}>{i18n.t(i18n.vessel(v))}</option>
            ))}
          </select>
        </GlassCard>

        <GlassCard hover={false}>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">{i18n.t('labelBoilMethod')}</label>
          <select
            className="glass-input w-full"
            value={config.boilMethod}
            onChange={(e) => setConfig({ ...config, boilMethod: Number(e.target.value) })}
          >
            {boilMethods.map((b) => (
              <option key={b} value={b}>{i18n.t(i18n.boilMethod(b))}</option>
            ))}
          </select>
        </GlassCard>

        <GlassCard hover={false}>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">{i18n.t('labelTemperature')}</label>
          <input type="number" className="glass-input w-full" value={config.currentTemp} onChange={(e) => setConfig({ ...config, currentTemp: Number(e.target.value) })} />
        </GlassCard>

        <GlassCard hover={false}>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">{i18n.t('labelLeafMass')}</label>
          <input type="number" className="glass-input w-full" value={config.leafMass} onChange={(e) => setConfig({ ...config, leafMass: Number(e.target.value) })} />
        </GlassCard>

        <GlassCard hover={false}>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">{i18n.t('labelWaterVolume')}</label>
          <input type="number" className="glass-input w-full" value={config.waterVolumeMl} onChange={(e) => setConfig({ ...config, waterVolumeMl: Number(e.target.value) })} />
        </GlassCard>

        <GlassCard hover={false}>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">{i18n.t('labelInfusions')}</label>
          <input type="number" className="glass-input w-full" value={config.numInfusions} onChange={(e) => setConfig({ ...config, numInfusions: Number(e.target.value) })} />
        </GlassCard>

        <GlassCard hover={false}>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">{i18n.t('labelTds')}</label>
          <input type="number" className="glass-input w-full" value={config.tds} onChange={(e) => setConfig({ ...config, tds: Number(e.target.value) })} />
        </GlassCard>

        <GlassCard hover={false}>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">{i18n.t('labelAltitude')}</label>
          <input type="number" className="glass-input w-full" value={config.altitudeM} onChange={(e) => setConfig({ ...config, altitudeM: Number(e.target.value) })} />
        </GlassCard>

        <GlassCard hover={false}>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">{i18n.t('labelLeafSize')}</label>
          <div className="flex gap-2">
            <input type="number" placeholder="Width" className="glass-input w-full" value={config.leafWidth} onChange={(e) => setConfig({ ...config, leafWidth: Number(e.target.value) })} />
            <input type="number" placeholder="Height" className="glass-input w-full" value={config.leafHeight} onChange={(e) => setConfig({ ...config, leafHeight: Number(e.target.value) })} />
          </div>
        </GlassCard>
      </div>

      <div className="flex justify-center">
        <button onClick={handleStart} className="glass-button-primary flex items-center gap-2 text-base px-8 py-4">
          <Settings className="w-5 h-5" />
          {i18n.t('advancedStartButton')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
