import { i18n } from '@/core/i18n/TranslationManager';
import { GlassCard } from '@/components/ui/GlassCard';

interface DeleteConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onCancel}
        aria-hidden="true"
      />
      <GlassCard className="relative z-10 w-full max-w-sm text-center space-y-4 p-6">
        <h3 className="text-lg font-semibold text-slate-100">
          {i18n.t('confirm')} {i18n.t('delete').toLowerCase()}
        </h3>
        <p className="text-sm text-slate-400">
          Are you sure you want to delete this brew log? This action cannot be
          undone.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onCancel}
            className="glass-button text-xs px-4 py-2"
          >
            {i18n.t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="glass-button text-xs px-4 py-2 text-red-300"
            style={{
              background:
                'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.1))',
              borderColor: 'rgba(239,68,68,0.3)',
            }}
          >
            {i18n.t('delete')}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
