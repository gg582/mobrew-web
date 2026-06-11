import { create } from 'zustand';
import { TeaType, VesselType, BoilMethod } from '@/domain/enums';
import type { UserPreset, BrewParameters } from '@/domain/appTypes';

type ParamsWithTime = BrewParameters & { steepTimeSec: number };

interface PresetStore {
  presets: UserPreset[];
  defaultPresets: UserPreset[];
  communityImports: UserPreset[];
  loadPresets: () => Promise<void>;
  savePreset: (preset: Omit<UserPreset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePreset: (id: string, partial: Partial<UserPreset>) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
  importPreset: (communityPreset: UserPreset) => Promise<void>;
  addCommunityImport: (communityPreset: UserPreset) => Promise<void>;
  applyPresetToAdvanced: (preset: UserPreset) => void;
}

function makePreset(
  id: string,
  name: string,
  teaType: TeaType,
  temperature: number,
  steepTimeSec: number
): UserPreset {
  const parameters: ParamsWithTime = {
    teaType,
    teaName: name,
    vessel: VesselType.Glass,
    boilMethod: BoilMethod.Electric,
    temperature,
    leafMass: 5,
    waterVolume: 200,
    steepCount: 3,
    tds: 100,
    altitude: 0,
    leafSize: 15,
    steepTimeSec,
  };
  return {
    id,
    name,
    teaType,
    parameters: parameters as BrewParameters,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const DEFAULT_PRESETS: UserPreset[] = [
  makePreset('sencha', 'Morning Sencha', TeaType.GreenSencha, 75, 60),
  makePreset('black', 'English Breakfast', TeaType.Black, 95, 180),
  makePreset('oolong', 'Gongfu Oolong', TeaType.Oolong, 90, 60),
  makePreset('puerh', 'Aged Pu-erh', TeaType.Puerh, 95, 180),
  makePreset('white', 'Silver Needle', TeaType.White, 80, 120),
  makePreset('green', 'Daily Green', TeaType.GreenNormal, 80, 120),
];

export const usePresetStore = create<PresetStore>((set, get) => ({
  presets: DEFAULT_PRESETS,
  defaultPresets: DEFAULT_PRESETS,
  communityImports: [],

  loadPresets: async () => {
    set({ presets: get().defaultPresets });
  },

  savePreset: async (preset) => {
    const newPreset: UserPreset = {
      ...preset,
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ presets: [newPreset, ...state.presets] }));
  },

  updatePreset: async (id, partial) => {
    set((state) => ({
      presets: state.presets.map((p) =>
        p.id === id ? { ...p, ...partial, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  deletePreset: async (id) => {
    set((state) => ({
      presets: state.presets.filter((p) => p.id !== id),
      communityImports: state.communityImports.filter((p) => p.id !== id),
    }));
  },

  importPreset: async (communityPreset) => {
    const imported: UserPreset = {
      ...communityPreset,
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      isCommunity: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      presets: [imported, ...state.presets],
      communityImports: [communityPreset, ...state.communityImports],
    }));
  },

  addCommunityImport: async (communityPreset) => {
    const exists = get().communityImports.some((p) => p.id === communityPreset.id);
    if (exists) return;
    set((state) => ({
      communityImports: [communityPreset, ...state.communityImports],
    }));
  },

  applyPresetToAdvanced: () => {
    // Reserved for future wiring into the advanced mode config.
  },
}));
