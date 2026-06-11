import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';
import { usePresetStore } from '@/stores/presetStore';
import { useBrewStore } from '@/stores/brewStore';
import { setAdvancedPrefill } from '@/services/advancedPrefill';
import { i18n } from '@/core/i18n/TranslationManager';
import { encodeRecipe, decodeRecipe } from '@/services/recipeHash';
import { TeaType, VesselType, BoilMethod } from '@/domain/enums';
import { TeaState } from '@/engine/TeaState';
import type { UserPreset, BrewParameters } from '@/domain/appTypes';
import {
  Search,
  Plus,
  Upload,
  Share2,
  Trash2,
  Play,
  Thermometer,
  Clock,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';

type TabKey = 'my' | 'default' | 'community';
type ModalView = 'save' | 'import' | null;

const MAX_USER_PRESETS = 20;

function getTeaIcon(teaType: TeaType): string {
  switch (teaType) {
    case TeaType.GreenNormal:
    case TeaType.GreenGyokuro:
    case TeaType.GreenSencha:
    case TeaType.GreenFukamushi:
      return '🍵';
    case TeaType.Black:
      return '☕';
    case TeaType.Oolong:
      return '🌿';
    case TeaType.White:
      return '🌸';
    case TeaType.Puerh:
      return '🍂';
    case TeaType.Yellow:
      return '💛';
    case TeaType.Tibetan:
      return '🧈';
    default:
      return '🍵';
  }
}

function formatSteepTime(seconds?: number): string {
  if (seconds === undefined || seconds === null) return '-';
  if (seconds < 60) return `${seconds}s`;
  const min = Math.round(seconds / 60);
  return `${min} min`;
}

function createEmptyForm(): BrewParameters & { steepTimeSec: number; name: string } {
  return {
    name: '',
    teaType: TeaType.GreenNormal,
    teaName: '',
    vessel: VesselType.Glass,
    boilMethod: BoilMethod.Electric,
    temperature: 80,
    leafMass: 5,
    waterVolume: 200,
    steepCount: 3,
    tds: 100,
    altitude: 0,
    leafSize: 15,
    steepTimeSec: 120,
  };
}

function stateToFormParams(state: TeaState): BrewParameters & { steepTimeSec: number; name: string } {
  return {
    name: '',
    teaType: state.teaType,
    teaName: '',
    vessel: state.vessel,
    boilMethod: state.boilMethod,
    temperature: state.currentTemp,
    leafMass: state.leafMass,
    waterVolume: state.waterVolumeMl,
    steepCount: state.numInfusions,
    tds: state.tds,
    altitude: state.altitudeM,
    leafSize: Math.round((state.leafWidth + state.leafHeight) / 2) || 15,
    steepTimeSec: 120,
  };
}

function makePresetFromForm(form: BrewParameters & { steepTimeSec: number; name: string }): Omit<UserPreset, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: form.name || form.teaName || 'Unnamed Preset',
    teaType: form.teaType,
    parameters: {
      teaType: form.teaType,
      teaName: form.teaName || form.name || 'Unnamed Preset',
      vessel: form.vessel,
      boilMethod: form.boilMethod,
      temperature: form.temperature,
      leafMass: form.leafMass,
      waterVolume: form.waterVolume,
      steepCount: form.steepCount,
      tds: form.tds,
      altitude: form.altitude,
      leafSize: form.leafSize,
      steepTimeSec: form.steepTimeSec,
    },
  };
}

function applyPresetToAdvanced(preset: UserPreset) {
  setAdvancedPrefill({
    ...preset.parameters,
    teaName: preset.name,
    steepTimeSec: preset.parameters.steepTimeSec ?? 0,
  });
}

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export default function PresetsPage() {
  const navigate = useNavigate();
  const [, forceUpdate] = useState(0);

  const presets = usePresetStore((s) => s.presets);
  const defaultPresets = usePresetStore((s) => s.defaultPresets);
  const communityImports = usePresetStore((s) => s.communityImports);
  const savePreset = usePresetStore((s) => s.savePreset);
  const deletePreset = usePresetStore((s) => s.deletePreset);
  const importPreset = usePresetStore((s) => s.importPreset);
  const addCommunityImport = usePresetStore((s) => s.addCommunityImport);

  const [activeTab, setActiveTab] = useState<TabKey>('my');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalView>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [saveForm, setSaveForm] = useState(createEmptyForm());
  const [importCode, setImportCode] = useState('');
  const [decoded, setDecoded] = useState<ReturnType<typeof decodeRecipe> | null>(null);

  useEffect(() => {
    const unsub = i18n.subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredPresets = useMemo(() => {
    const source =
      activeTab === 'my'
        ? presets.filter((p) => !p.isDefault)
        : activeTab === 'default'
        ? defaultPresets
        : communityImports;

    const term = search.trim().toLowerCase();
    if (!term) return source;
    return source.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        i18n.t(i18n.teaType(p.teaType)).toLowerCase().includes(term)
    );
  }, [activeTab, presets, defaultPresets, communityImports, search]);

  const userPresetCount = presets.filter((p) => !p.isDefault).length;
  const atLimit = userPresetCount >= MAX_USER_PRESETS;

  const handleOpenSave = () => {
    setSaveForm(createEmptyForm());
    setModal('save');
  };

  const handleLoadCurrent = () => {
    const state = useBrewStore.getState().facade.getState();
    setSaveForm(stateToFormParams(state));
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveForm.name.trim()) return;
    if (atLimit) return;
    await savePreset(makePresetFromForm(saveForm));
    setModal(null);
    setToast('Preset saved');
  };

  const handleShare = async (preset: UserPreset) => {
    const params = preset.parameters;
    const hash = encodeRecipe({
      teaType: params.teaType,
      teaName: params.teaName || preset.name,
      vessel: params.vessel,
      boilMethod: params.boilMethod,
      temperature: params.temperature,
      leafMass: params.leafMass,
      waterVolume: params.waterVolume,
      steepCount: params.steepCount,
      tds: params.tds,
      altitude: params.altitude,
      leafSize: params.leafSize,
      steepTimeSec: params.steepTimeSec ?? 120,
    });

    const shareData = {
      title: `MOBREW Recipe: ${preset.name}`,
      text: `Check out this tea recipe: ${preset.name}`,
      url: `${window.location.origin}/presets?recipe=${encodeURIComponent(hash)}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(hash);
        setToast(i18n.t('recipeCopied'));
      }
    } catch {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(hash);
        setToast(i18n.t('recipeCopied'));
      }
    }
  };

  const handleApply = (preset: UserPreset) => {
    applyPresetToAdvanced(preset);
    navigate('/advanced');
  };

  const handleDelete = async (id: string) => {
    await deletePreset(id);
  };

  const handleImportCommunity = async (preset: UserPreset) => {
    await importPreset(preset);
    setToast('Imported to My Presets');
  };

  const handleDecodeImport = () => {
    const result = decodeRecipe(importCode.trim());
    setDecoded(result);
  };

  const handleApplyDecoded = async () => {
    if (!decoded || !decoded.success) return;
    if (atLimit) return;
    const p = decoded.params;
    await savePreset({
      name: decoded.name || p.teaName || 'Imported Recipe',
      teaType: p.teaType,
      parameters: {
        teaType: p.teaType,
        teaName: p.teaName || decoded.name || 'Imported Recipe',
        vessel: p.vessel,
        boilMethod: p.boilMethod,
        temperature: p.temperature,
        leafMass: p.leafMass,
        waterVolume: p.waterVolume,
        steepCount: p.steepCount,
        tds: p.tds,
        altitude: p.altitude,
        leafSize: p.leafSize,
        steepTimeSec: p.steepTimeSec,
      },
    });
    await addCommunityImport({
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      name: decoded.name || p.teaName || 'Imported Recipe',
      teaType: p.teaType,
      parameters: {
        teaType: p.teaType,
        teaName: p.teaName || decoded.name || 'Imported Recipe',
        vessel: p.vessel,
        boilMethod: p.boilMethod,
        temperature: p.temperature,
        leafMass: p.leafMass,
        waterVolume: p.waterVolume,
        steepCount: p.steepCount,
        tds: p.tds,
        altitude: p.altitude,
        leafSize: p.leafSize,
        steepTimeSec: p.steepTimeSec,
      },
      isCommunity: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setModal(null);
    setImportCode('');
    setDecoded(null);
    setToast('Recipe imported');
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'my', label: i18n.t('presetsMy') },
    { key: 'default', label: i18n.t('presetsDefault') },
    { key: 'community', label: i18n.t('presetsCommunity') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-glow">{i18n.t('presetsTitle')}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModal('import')}
            className="glass-button flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
          >
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {i18n.t('import')}
          </button>
          <button
            onClick={handleOpenSave}
            disabled={atLimit}
            className={classNames(
              'glass-button-primary flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3',
              atLimit && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {i18n.t('presetsSaveCurrent')}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={i18n.t('presetsSearch')}
            className="glass-input w-full pl-10 pr-4 py-2"
          />
        </div>
        <div className="text-xs text-slate-400">
          {activeTab === 'my' && (
            <span>
              {userPresetCount} / {MAX_USER_PRESETS}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={classNames(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.key
                ? 'text-tea-green border-tea-green'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredPresets.length === 0 ? (
        <GlassCard hover={false} className="text-center py-12">
          <p className="text-slate-400">
            {search.trim() ? 'No matching presets.' : 'No presets yet.'}
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPresets.map((preset) => (
            <GlassCard key={`${activeTab}-${preset.id}`} hover={false} className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">
                  {getTeaIcon(preset.teaType)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{preset.name}</div>
                  <div className="text-xs text-slate-400">
                    {i18n.t(i18n.teaType(preset.teaType))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3" />
                  {preset.parameters.temperature}°C
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatSteepTime(preset.parameters.steepTimeSec)}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/10">
                <button
                  onClick={() => handleApply(preset)}
                  className="flex-1 glass-button flex items-center justify-center gap-1 text-xs py-2"
                >
                  <Play className="w-3 h-3" />
                  {i18n.t('presetsApply')}
                </button>
                <button
                  onClick={() => handleShare(preset)}
                  className="glass-button flex items-center justify-center gap-1 text-xs py-2 px-3"
                  aria-label={i18n.t('presetsShare')}
                >
                  <Share2 className="w-3 h-3" />
                </button>
                {activeTab === 'my' && (
                  <button
                    onClick={() => handleDelete(preset.id)}
                    className="glass-button flex items-center justify-center gap-1 text-xs py-2 px-3 text-red-300 hover:text-red-200"
                    aria-label={i18n.t('delete')}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {activeTab === 'community' && (
                  <button
                    onClick={() => handleImportCommunity(preset)}
                    className="glass-button-primary flex items-center justify-center gap-1 text-xs py-2 px-3"
                  >
                    <Upload className="w-3 h-3" />
                    {i18n.t('presetsImport')}
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="glass-strong rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-glow">
                {modal === 'save' ? i18n.t('presetsSaveCurrent') : i18n.t('presetsImport')}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modal === 'save' && (
              <form onSubmit={handleSaveSubmit} className="space-y-4">
                {atLimit && (
                  <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {i18n.t('presetsLimit')}
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleLoadCurrent}
                    className="text-xs text-tea-green hover:underline"
                  >
                    Load current brew parameters
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Name
                  </label>
                  <input
                    required
                    value={saveForm.name}
                    onChange={(e) => setSaveForm({ ...saveForm, name: e.target.value })}
                    placeholder={i18n.t('presetsNamePlaceholder')}
                    className="glass-input w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      {i18n.t('labelTeaType')}
                    </label>
                    <select
                      value={saveForm.teaType}
                      onChange={(e) =>
                        setSaveForm({ ...saveForm, teaType: Number(e.target.value) as TeaType })
                      }
                      className="glass-input w-full"
                    >
                      {(Object.values(TeaType).filter((v) => typeof v === 'number') as TeaType[]).map((t) => (
                        <option key={t} value={t}>
                          {i18n.t(i18n.teaType(t))}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      {i18n.t('labelTemperature')}
                    </label>
                    <input
                      type="number"
                      value={saveForm.temperature}
                      onChange={(e) =>
                        setSaveForm({ ...saveForm, temperature: Number(e.target.value) })
                      }
                      className="glass-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      {i18n.t('labelLeafMass')}
                    </label>
                    <input
                      type="number"
                      value={saveForm.leafMass}
                      onChange={(e) =>
                        setSaveForm({ ...saveForm, leafMass: Number(e.target.value) })
                      }
                      className="glass-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      {i18n.t('labelWaterVolume')}
                    </label>
                    <input
                      type="number"
                      value={saveForm.waterVolume}
                      onChange={(e) =>
                        setSaveForm({ ...saveForm, waterVolume: Number(e.target.value) })
                      }
                      className="glass-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      {i18n.t('labelInfusions')}
                    </label>
                    <input
                      type="number"
                      value={saveForm.steepCount}
                      onChange={(e) =>
                        setSaveForm({ ...saveForm, steepCount: Number(e.target.value) })
                      }
                      className="glass-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Steep time (sec)
                    </label>
                    <input
                      type="number"
                      value={saveForm.steepTimeSec}
                      onChange={(e) =>
                        setSaveForm({ ...saveForm, steepTimeSec: Number(e.target.value) })
                      }
                      className="glass-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      {i18n.t('labelTds')}
                    </label>
                    <input
                      type="number"
                      value={saveForm.tds}
                      onChange={(e) => setSaveForm({ ...saveForm, tds: Number(e.target.value) })}
                      className="glass-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      {i18n.t('labelAltitude')}
                    </label>
                    <input
                      type="number"
                      value={saveForm.altitude}
                      onChange={(e) =>
                        setSaveForm({ ...saveForm, altitude: Number(e.target.value) })
                      }
                      className="glass-input w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="glass-button text-xs"
                  >
                    {i18n.t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={atLimit || !saveForm.name.trim()}
                    className={classNames(
                      'glass-button-primary text-xs flex items-center gap-1',
                      (atLimit || !saveForm.name.trim()) && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Check className="w-4 h-4" />
                    {i18n.t('save')}
                  </button>
                </div>
              </form>
            )}

            {modal === 'import' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Recipe code
                  </label>
                  <textarea
                    rows={3}
                    value={importCode}
                    onChange={(e) => {
                      setImportCode(e.target.value);
                      setDecoded(null);
                    }}
                    placeholder={i18n.t('recipeImportPlaceholder')}
                    className="glass-input w-full font-mono text-xs"
                  />
                </div>

                <button
                  onClick={handleDecodeImport}
                  disabled={!importCode.trim()}
                  className={classNames(
                    'glass-button w-full text-xs',
                    !importCode.trim() && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  Decode Recipe
                </button>

                {decoded && !decoded.success && (
                  <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {decoded.error}
                  </div>
                )}

                {decoded && decoded.success && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-glow">
                      {i18n.t('recipePreviewTitle')}: {decoded.name}
                    </h4>
                    <GlassCard hover={false} className="p-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{i18n.t('labelTeaType')}</span>
                        <span>{i18n.t(i18n.teaType(decoded.params.teaType))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{i18n.t('labelTemperature')}</span>
                        <span>{decoded.params.temperature}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{i18n.t('brewTime')}</span>
                        <span>{formatSteepTime(decoded.params.steepTimeSec)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{i18n.t('labelLeafMass')}</span>
                        <span>{decoded.params.leafMass}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{i18n.t('labelWaterVolume')}</span>
                        <span>{decoded.params.waterVolume}ml</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{i18n.t('labelInfusions')}</span>
                        <span>{decoded.params.steepCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{i18n.t('labelTds')}</span>
                        <span>{decoded.params.tds}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{i18n.t('labelAltitude')}</span>
                        <span>{decoded.params.altitude}m</span>
                      </div>
                    </GlassCard>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setModal(null);
                          setImportCode('');
                          setDecoded(null);
                        }}
                        className="glass-button text-xs"
                      >
                        {i18n.t('recipePreviewCancel')}
                      </button>
                      <button
                        onClick={handleApplyDecoded}
                        className="glass-button-primary text-xs flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        {i18n.t('recipePreviewApply')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
