import { i18n } from '@/core/i18n/TranslationManager';
import { GlassCard } from '@/components/ui/GlassCard';
import { Coffee } from 'lucide-react';

export function BrewLogEmptyState() {
  return (
    <GlassCard hover={false} className="text-center py-12 sm:py-16">
      <Coffee className="w-12 h-12 mx-auto text-slate-500 mb-4" />
      <p className="text-slate-400">{i18n.t('brewLogEmpty')}</p>
    </GlassCard>
  );
}
