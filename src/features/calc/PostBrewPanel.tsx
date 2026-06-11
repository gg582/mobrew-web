import { useState } from 'react';
import { useBrewStore } from '@/stores/brewStore';
import { useBrewLogStore } from '@/stores/brewLogStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useBadgeStore } from '@/stores/badgeStore';
import { i18n } from '@/core/i18n/TranslationManager';
import { GlassCard } from '@/components/ui/GlassCard';
import { Star, Save, RotateCcw, FileText } from 'lucide-react';
import { calculate } from '@/services/calculationMachine';
import { generateBrewReportPdf } from '@/services/exportService';
import type { BrewLogEntry, ExtractionResult, BrewParameters } from '@/domain/appTypes';

interface PostBrewPanelProps {
  onReset: () => void;
}

export default function PostBrewPanel({ onReset }: PostBrewPanelProps) {
  const { snapshot } = useBrewStore();
  const addLog = useBrewLogStore((s) => s.addLog);
  const { items, updateItem } = useInventoryStore();
  const evaluateAfterBrew = useBadgeStore((s) => s.evaluateAfterBrew);

  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [teaName, setTeaName] = useState('');

  if (!snapshot) return null;

  const state = useBrewStore.getState().facade.getState();
  const steepTimeSec = Math.round(snapshot.elapsedMs / 1000);

  const name = teaName.trim() || i18n.t(i18n.teaType(state.teaType));

  const parameters: BrewParameters = {
    teaType: state.teaType,
    teaName: name,
    vessel: state.vessel,
    boilMethod: state.boilMethod,
    temperature: state.currentTemp,
    leafMass: state.leafMass,
    waterVolume: state.waterVolumeMl,
    steepCount: state.currentInfusion,
    tds: state.tds,
    altitude: state.altitudeM,
    leafSize: state.leafWidth,
    steepTimeSec,
  };

  const composition: ExtractionResult = {
    catechin: snapshot.components.catechin,
    theanine: snapshot.components.aminoAcid,
    caffeine: snapshot.components.caffeine,
    pectin: snapshot.components.pectin,
    polysaccharide: snapshot.components.polysaccharide,
    aroma: snapshot.components.aroma,
  };

  const calc = calculate({
    id: '',
    timestamp: Date.now(),
    teaName: name,
    teaType: state.teaType,
    parameters,
    rating,
    notes,
    composition,
    balanceScore: 0,
    extractionYield: 0,
    strength: 'optimal',
    clarityIndex: snapshot.clarityIndex,
  });

  const handleSave = async () => {
    const entry: Omit<BrewLogEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      timestamp: Date.now(),
      teaName: name,
      teaType: state.teaType,
      parameters,
      rating,
      notes,
      composition,
      balanceScore: calc.balanceScore,
      extractionYield: calc.extractionYieldPercent,
      strength: calc.strength,
      clarityIndex: snapshot.clarityIndex,
    };
    await addLog(entry);

    // Deduct from inventory if matching tea name/type found
    const inventoryMatch = items.find(
      (it) => it.teaType === state.teaType && (it.name === name || name.includes(it.name))
    );
    if (inventoryMatch) {
      await updateItem(inventoryMatch.id, {
        quantityGrams: Math.max(0, inventoryMatch.quantityGrams - state.leafMass),
      });
    }

    evaluateAfterBrew(entry as BrewLogEntry);
    setSaved(true);
  };

  const handleExportPdf = () => {
    const log: BrewLogEntry = {
      id: `tmp_${Date.now()}`,
      timestamp: Date.now(),
      teaName: name,
      teaType: state.teaType,
      parameters,
      rating,
      notes,
      composition,
      balanceScore: calc.balanceScore,
      extractionYield: calc.extractionYieldPercent,
      strength: calc.strength,
      clarityIndex: snapshot.clarityIndex,
    };
    const doc = generateBrewReportPdf(log);
    doc.save(`mobrew-${name}-${Date.now()}.pdf`);
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center gap-2 text-tea-green font-semibold">
        <FileText className="w-5 h-5" />
        {i18n.t('calcTitle')}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="glass rounded-lg p-3">
          <div className="text-slate-400 text-xs">{i18n.t('calcExtractionYield')}</div>
          <div className="font-mono text-lg">{calc.extractionYieldPercent.toFixed(1)}%</div>
        </div>
        <div className="glass rounded-lg p-3">
          <div className="text-slate-400 text-xs">{i18n.t('calcBalanceScore')}</div>
          <div className="font-mono text-lg">{calc.balanceScore.toFixed(0)}/100</div>
        </div>
        <div className="glass rounded-lg p-3">
          <div className="text-slate-400 text-xs">{i18n.t('calcStrength')}</div>
          <div className="font-medium capitalize">{i18n.t(`calc${calc.strength.replace(/-/g, '')}` as any)}</div>
        </div>
      </div>

      {calc.suggestionKey && (
        <div className="text-sm text-slate-300 bg-white/5 rounded-lg p-3">
          {i18n.t(calc.suggestionKey as any)}
        </div>
      )}

      {!saved ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">{i18n.t('labelTeaType')} / {i18n.t('inventoryName')}</label>
            <input
              type="text"
              className="glass-input w-full"
              value={teaName}
              onChange={(e) => setTeaName(e.target.value)}
              placeholder={name}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">{i18n.t('brewLogRating')}</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className={s <= rating ? 'text-amber-400' : 'text-slate-600'}>
                  <Star className="w-6 h-6" fill={s <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">{i18n.t('brewLogAddNote')}</label>
            <textarea
              className="glass-input w-full min-h-[80px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={i18n.t('brewLogNotesPlaceholder')}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={handleSave} className="glass-button-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {i18n.t('brewLogAddNote')}
            </button>
            <button onClick={handleExportPdf} className="glass-button flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {i18n.t('brewLogExportPdf')}
            </button>
            <button onClick={onReset} className="glass-button flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              {i18n.t('reset')}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <div className="text-tea-green font-medium">{i18n.t('save')}</div>
          <button onClick={onReset} className="glass-button flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" />
            {i18n.t('reset')}
          </button>
        </div>
      )}
    </GlassCard>
  );
}
