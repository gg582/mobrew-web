import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrewStore } from '@/stores/brewStore';
import { BrewingRegion, TeaType } from '@/domain/enums';
import { REGION_PRESETS } from '@/data/presets';
import { TEA_TYPE_LABELS, VESSEL_LABELS } from '@/data/constants';
import { GlassCard } from './ui/GlassCard';
import { Leaf, ChevronRight, Zap } from 'lucide-react';

const regions = Object.values(BrewingRegion);

interface EasyModePanelProps {
  onStart: () => void;
}

export function EasyModePanel({ onStart }: EasyModePanelProps) {
  const { startEasyMode, beginBrewing } = useBrewStore();
  const [selectedRegion, setSelectedRegion] = useState<BrewingRegion | null>(null);
  const [selectedTea, setSelectedTea] = useState<TeaType | null>(null);

  const handleRegionSelect = (region: BrewingRegion) => {
    setSelectedRegion(region);
    setSelectedTea(null);
  };

  const handleStart = () => {
    if (selectedRegion && selectedTea !== null) {
      startEasyMode(selectedRegion, selectedTea);
      beginBrewing();
      onStart();
    }
  };

  const preset = selectedRegion ? REGION_PRESETS[selectedRegion] : null;
  const availableTeas = preset ? preset.easyModeTeas : [];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-glow">Easy Mode</h2>
        <p className="text-sm text-slate-400">Pick a region and tea type. We handle the science.</p>
      </div>

      {/* Region Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {regions.map((region) => {
          const r = REGION_PRESETS[region];
          const active = selectedRegion === region;
          return (
            <motion.button
              key={region}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRegionSelect(region)}
              className={`glass-card p-4 text-center cursor-pointer border-2 transition-colors ${
                active ? 'border-tea-green/50 bg-tea-green/10' : 'border-transparent'
              }`}
            >
              <div className="text-3xl mb-2">{r.emoji}</div>
              <div className="text-sm font-medium">{r.name}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Tea Selection */}
      <AnimatePresence>
        {selectedRegion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-slate-300">
              <Leaf className="w-4 h-4 text-tea-green" />
              <span className="text-sm font-medium">Select Tea Type</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableTeas.map((tea) => {
                const active = selectedTea === tea;
                return (
                  <motion.button
                    key={tea}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTea(tea)}
                    className={`glass-card py-3 px-4 text-left cursor-pointer border-2 transition-colors ${
                      active ? 'border-tea-green/50 bg-tea-green/10' : 'border-transparent'
                    }`}
                  >
                    <div className="text-sm font-medium">{TEA_TYPE_LABELS[tea]}</div>
                  </motion.button>
                );
              })}
            </div>

            {/* Preset Summary */}
            {preset && selectedTea !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                <GlassCard hover={false} className="text-center">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Vessel</div>
                  <div className="text-sm font-semibold mt-1">{VESSEL_LABELS[preset.defaultVessel]}</div>
                </GlassCard>
                <GlassCard hover={false} className="text-center">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Temp</div>
                  <div className="text-sm font-semibold mt-1">{preset.defaultTemp}°C</div>
                </GlassCard>
                <GlassCard hover={false} className="text-center">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Leaf</div>
                  <div className="text-sm font-semibold mt-1">{preset.defaultLeafMass}g</div>
                </GlassCard>
                <GlassCard hover={false} className="text-center">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Infusions</div>
                  <div className="text-sm font-semibold mt-1">{preset.defaultNumInfusions}</div>
                </GlassCard>
              </motion.div>
            )}

            {/* Start Button */}
            {selectedTea !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center"
              >
                <button
                  onClick={handleStart}
                  className="glass-button-primary flex items-center gap-2 text-base px-8 py-4"
                >
                  <Zap className="w-5 h-5" />
                  Start Brewing
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
