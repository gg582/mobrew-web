import { create } from 'zustand';
import { BrewFacade } from '@/facades/BrewFacade';
import { BrewingRegion, TeaType } from '@/domain/enums';
import type { SimulationSnapshot, TeaStateData } from '@/domain/types';

interface BrewStore {
  facade: BrewFacade;
  mode: 'idle' | 'easy' | 'expert' | 'brewing' | 'paused' | 'complete' | 'exhausted';
  region: BrewingRegion | null;
  selectedTea: TeaType | null;
  snapshot: SimulationSnapshot | null;
  history: SimulationSnapshot[];
  showStats: boolean;
  
  // Actions
  startEasyMode: (region: BrewingRegion, tea: TeaType) => void;
  startExpertMode: (config: Partial<TeaStateData>) => void;
  beginBrewing: () => void;
  pauseBrewing: () => void;
  resumeBrewing: () => void;
  stopBrewing: () => void;
  nextInfusion: (temp: number, volume: number) => void;
  reset: () => void;
  toggleStats: () => void;
  setSnapshot: (s: SimulationSnapshot) => void;
  pushHistory: (s: SimulationSnapshot) => void;
}

export const useBrewStore = create<BrewStore>((set, get) => ({
  facade: new BrewFacade(),
  mode: 'idle',
  region: null,
  selectedTea: null,
  snapshot: null,
  history: [],
  showStats: false,

  startEasyMode: (region, tea) => {
    const facade = new BrewFacade();
    facade.applyRegionPreset(region, tea);
    set({ facade, region, selectedTea: tea, mode: 'easy', snapshot: null, history: [] });
  },

  startExpertMode: (config) => {
    const facade = new BrewFacade();
    facade.applyExpertConfig(config as any);
    set({ facade, region: null, selectedTea: config.teaType ?? null, mode: 'expert', snapshot: null, history: [] });
  },

  beginBrewing: () => {
    const { facade } = get();
    facade.onTick((snap) => {
      set({ snapshot: snap });
    });
    facade.onComplete(() => {
      const snap = get().snapshot;
      if (snap) get().pushHistory(snap);
      set({ mode: 'complete' });
    });
    facade.onExhausted(() => {
      set({ mode: 'exhausted' });
    });
    facade.startSession();
    set({ mode: 'brewing' });
  },

  pauseBrewing: () => {
    get().facade.stopSession();
    set({ mode: 'paused' });
  },

  resumeBrewing: () => {
    const { facade } = get();
    facade.startSession();
    set({ mode: 'brewing' });
  },

  stopBrewing: () => {
    get().facade.stopSession();
    set({ mode: 'idle', snapshot: null });
  },

  nextInfusion: (temp, volume) => {
    get().facade.nextInfusion(temp, volume);
    set({ mode: 'brewing' });
  },

  reset: () => {
    get().facade.stopSession();
    set({ mode: 'idle', region: null, selectedTea: null, snapshot: null, history: [], showStats: false });
  },

  toggleStats: () => set((s) => ({ showStats: !s.showStats })),
  setSnapshot: (s) => set({ snapshot: s }),
  pushHistory: (snap) => set((state) => ({ history: [...state.history, snap] })),
}));
