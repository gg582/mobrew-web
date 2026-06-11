import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Coffee, FileText, PackageOpen } from 'lucide-react';
import { useInventoryStore } from '@/stores/inventoryStore';
import { setAdvancedPrefill } from '@/services/advancedPrefill';
import { i18n } from '@/core/i18n/TranslationManager';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { TeaType } from '@/domain/enums';
import type { StorageCondition, TeaInventoryItem } from '@/domain/appTypes';

const STORAGE_CONDITIONS: StorageCondition[] = ['sealed', 'opened', 'refrigerated', 'frozen'];

interface FormState {
  name: string;
  teaType: TeaType;
  purchaseDate: string;
  quantityGrams: number;
  storageCondition: StorageCondition;
  vendor: string;
  cost: number | '';
  lowStockThreshold: number;
}

function toFormState(item?: TeaInventoryItem | null): FormState {
  return {
    name: item?.name ?? '',
    teaType: item?.teaType ?? TeaType.GreenNormal,
    purchaseDate: item?.purchaseDate ?? new Date().toISOString().split('T')[0],
    quantityGrams: item?.quantityGrams ?? 0,
    storageCondition: item?.storageCondition ?? 'sealed',
    vendor: item?.vendor ?? '',
    cost: item?.cost ?? '',
    lowStockThreshold: item?.lowStockThreshold ?? 10,
  };
}

function storageTranslationKey(condition: StorageCondition): 'storageSealed' | 'storageOpened' | 'storageRefrigerated' | 'storageFrozen' {
  switch (condition) {
    case 'sealed':
      return 'storageSealed';
    case 'opened':
      return 'storageOpened';
    case 'refrigerated':
      return 'storageRefrigerated';
    case 'frozen':
      return 'storageFrozen';
    default:
      return 'storageSealed';
  }
}

export default function InventoryPage() {
  const navigate = useNavigate();
  const [, forceUpdate] = useState(0);
  const { items, loading, loadInventory, addItem, updateItem, removeItem } = useInventoryStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(toFormState());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = i18n.subscribe(() => forceUpdate((n) => n + 1));
    loadInventory();
    return unsub;
  }, [loadInventory]);

  const teaTypes = useMemo(
    () => Object.values(TeaType).filter((v) => typeof v === 'number') as TeaType[],
    []
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(toFormState());
    setModalOpen(true);
  };

  const openEdit = (item: TeaInventoryItem) => {
    setEditingId(item.id);
    setForm(toFormState(item));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    const payload: Omit<TeaInventoryItem, 'id' | 'createdAt' | 'updatedAt'> = {
      name: form.name.trim(),
      teaType: form.teaType,
      purchaseDate: form.purchaseDate,
      quantityGrams: Number(form.quantityGrams) || 0,
      storageCondition: form.storageCondition,
      vendor: form.vendor.trim() || undefined,
      cost: form.cost === '' ? undefined : Number(form.cost),
      lowStockThreshold: Number(form.lowStockThreshold) || 0,
    };

    if (editingId) {
      await updateItem(editingId, payload);
    } else {
      await addItem(payload);
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await removeItem(id);
    setDeletingId(null);
  };

  const handleBrewThis = (item: TeaInventoryItem) => {
    const leafMass = Math.min(Math.max(1, item.quantityGrams), 10);
    setAdvancedPrefill({
      teaName: item.name,
      teaType: item.teaType,
      leafMass,
      steepCount: 1,
    });
    navigate('/advanced');
  };

  const handleLogPastBrew = (item: TeaInventoryItem) => {
    setAdvancedPrefill({
      teaName: item.name,
      teaType: item.teaType,
      leafMass: 5,
      steepCount: 1,
    });
    navigate('/advanced');
  };

  const canSave = form.name.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold text-glow">{i18n.t('inventoryTitle')}</h2>
          <p className="text-sm text-slate-400">
            {items.length} {i18n.t('inventoryQty').toLowerCase()}
          </p>
        </div>
        <button onClick={openAdd} className="glass-button-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {i18n.t('inventoryAddTea')}
        </button>
      </div>

      {loading && items.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">{i18n.t('loading')}</div>
        </div>
      )}

      {!loading && items.length === 0 && (
        <GlassCard hover={false} className="flex flex-col items-center justify-center text-center py-16">
          <PackageOpen className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">{i18n.t('inventoryEmpty')}</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">{i18n.t('inventoryAddTea')}</p>
          <button onClick={openAdd} className="glass-button-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {i18n.t('inventoryAddTea')}
          </button>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {items.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onEdit={() => openEdit(item)}
              onDelete={() => setDeletingId(item.id)}
              onBrew={() => handleBrewThis(item)}
              onLog={() => handleLogPastBrew(item)}
            />
          ))}
        </AnimatePresence>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="glass-strong w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-glow">
                {editingId ? i18n.t('inventoryEdit') : i18n.t('inventoryAddTea')}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-200">
                {i18n.t('close')}
              </button>
            </div>

            <div className="space-y-4">
              <label className="block space-y-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider">{i18n.t('inventoryName')}</span>
                <input
                  type="text"
                  className="glass-input w-full"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={i18n.t('inventoryName')}
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">{i18n.t('inventoryType')}</span>
                  <select
                    className="glass-input w-full"
                    value={form.teaType}
                    onChange={(e) => setForm({ ...form, teaType: Number(e.target.value) })}
                  >
                    {teaTypes.map((t) => (
                      <option key={t} value={t}>
                        {i18n.t(i18n.teaType(t))}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">{i18n.t('inventoryPurchased')}</span>
                  <input
                    type="date"
                    className="glass-input w-full"
                    value={form.purchaseDate}
                    onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">{i18n.t('inventoryQty')} (g)</span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    className="glass-input w-full"
                    value={form.quantityGrams}
                    onChange={(e) => setForm({ ...form, quantityGrams: Number(e.target.value) })}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">{i18n.t('inventoryStorage')}</span>
                  <select
                    className="glass-input w-full"
                    value={form.storageCondition}
                    onChange={(e) => setForm({ ...form, storageCondition: e.target.value as StorageCondition })}
                  >
                    {STORAGE_CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {i18n.t(storageTranslationKey(c))}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">{i18n.t('inventoryVendor')}</span>
                  <input
                    type="text"
                    className="glass-input w-full"
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    placeholder={i18n.t('inventoryVendor')}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">{i18n.t('inventoryCost')}</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="glass-input w-full"
                    value={form.cost}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm({ ...form, cost: v === '' ? '' : Number(v) });
                    }}
                    placeholder="0.00"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider">{i18n.t('inventoryThreshold')} (g)</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="glass-input w-full"
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={closeModal} className="glass-button">
                {i18n.t('cancel')}
              </button>
              <button onClick={handleSave} disabled={!canSave} className="glass-button-primary disabled:opacity-50">
                {i18n.t('save')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {deletingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingId(null);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="glass-strong w-full max-w-sm rounded-2xl p-4 sm:p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-glow">{i18n.t('inventoryDelete')}</h3>
            <p className="text-sm text-slate-300">{i18n.t('confirm')}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingId(null)} className="glass-button">
                {i18n.t('cancel')}
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="glass-button text-red-300 border-red-400/30 hover:bg-red-500/20"
              >
                {i18n.t('delete')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface InventoryCardProps {
  item: TeaInventoryItem;
  onEdit: () => void;
  onDelete: () => void;
  onBrew: () => void;
  onLog: () => void;
}

function InventoryCard({ item, onEdit, onDelete, onBrew, onLog }: InventoryCardProps) {
  const maxGrams = Math.max(item.quantityGrams, item.lowStockThreshold * 2);
  const pct = maxGrams > 0 ? (item.quantityGrams / maxGrams) * 100 : 0;
  const isLow = item.quantityGrams < item.lowStockThreshold;

  let barColor = 'bg-emerald-400';
  if (isLow) barColor = 'bg-red-500';
  else if (pct < 50) barColor = 'bg-amber-400';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <GlassCard className="relative flex flex-col h-full p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold truncate" title={item.name}>
              {item.name}
            </h3>
            <div className="text-xs text-slate-400">{i18n.t(i18n.teaType(item.teaType))}</div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onEdit}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label={i18n.t('inventoryEdit')}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-red-500/20 text-slate-300 hover:text-red-300 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label={i18n.t('inventoryDelete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-4">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">{i18n.t('inventoryPurchased')}</div>
            <div className="text-slate-200">{item.purchaseDate}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">{i18n.t('inventoryQty')}</div>
            <div className={cn('font-medium', isLow ? 'text-red-300' : 'text-slate-200')}>
              {item.quantityGrams} g
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">{i18n.t('inventoryStorage')}</div>
            <div className="text-slate-200">{i18n.t(storageTranslationKey(item.storageCondition))}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">{i18n.t('inventoryVendor')}</div>
            <div className="text-slate-200 truncate" title={item.vendor || ''}>
              {item.vendor || '-'}
            </div>
          </div>
          {typeof item.cost === 'number' && (
            <div className="col-span-2">
              <div className="text-xs text-slate-500 uppercase tracking-wider">{i18n.t('inventoryCost')}</div>
              <div className="text-slate-200">{item.cost.toFixed(2)}</div>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">{i18n.t('inventoryQty')}</span>
              <span className={cn('font-medium', isLow ? 'text-red-300' : 'text-slate-300')}>
                {Math.round(pct)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-700/60 overflow-hidden">
              <div
                className={cn('h-full transition-all duration-500', barColor)}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>

          {isLow && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-medium border border-amber-500/30">
              {i18n.t('inventoryLowStock')}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onBrew}
              className="glass-button flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs py-1.5 sm:py-2 px-2 sm:px-3"
            >
              <Coffee className="w-3.5 h-3.5" />
              {i18n.t('inventoryBrewThis')}
            </button>
            <button
              onClick={onLog}
              className="glass-button flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs py-1.5 sm:py-2 px-2 sm:px-3"
            >
              <FileText className="w-3.5 h-3.5" />
              {i18n.t('inventoryLogPast')}
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
