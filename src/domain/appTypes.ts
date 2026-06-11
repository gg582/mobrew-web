import { TeaType, VesselType, BoilMethod } from './enums';

export type StorageCondition = 'sealed' | 'opened' | 'refrigerated' | 'frozen';

export interface ExtractionResult {
  catechin: number;
  theanine: number; // amino acid proxy
  caffeine: number;
  pectin: number;
  polysaccharide: number;
  aroma: number;
}

export interface BrewParameters {
  teaType: TeaType;
  teaName: string;
  vessel: VesselType;
  boilMethod: BoilMethod;
  temperature: number;
  leafMass: number;
  waterVolume: number;
  steepCount: number;
  tds: number;
  altitude: number;
  leafSize: number;
  steepTimeSec?: number;
}

export interface BrewLogEntry {
  id: string;
  userId?: string | null;
  timestamp: number;
  teaName: string;
  teaType: TeaType;
  parameters: BrewParameters;
  rating: number; // 1-5
  notes: string;
  composition: ExtractionResult;
  balanceScore: number;
  extractionYield: number;
  strength: StrengthClassification;
  clarityIndex: number;
  createdAt?: string;
  updatedAt?: string;
}

export type StrengthClassification = 'under-extracted' | 'optimal' | 'over-extracted';

export interface TeaInventoryItem {
  id: string;
  userId?: string | null;
  name: string;
  teaType: TeaType;
  purchaseDate: string;
  quantityGrams: number;
  storageCondition: StorageCondition;
  vendor?: string;
  cost?: number;
  lowStockThreshold: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPreset {
  id: string;
  userId?: string | null;
  name: string;
  teaType: TeaType;
  parameters: BrewParameters;
  isDefault?: boolean;
  isCommunity?: boolean;
  upvotes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurvePhase {
  id: string;
  durationSec: number;
  targetTemp: number;
  waterAdditionMl?: number;
}

export interface CustomCurve {
  id: string;
  userId?: string | null;
  name: string;
  teaType: TeaType;
  phases: CurvePhase[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BadgeDefinition {
  id: string;
  icon: string;
  nameKey: string;
  descKey: string;
  category: 'activity' | 'explorer' | 'precision' | 'streak' | 'archetype';
  condition: string; // simple descriptor
  maxProgress: number;
}

export interface UserBadge {
  id: string;
  badgeId: string;
  earnedAt?: string;
  progress: number;
}

export interface UserSettings {
  userId?: string;
  language: 'en' | 'ko' | 'zh' | 'jp';
  timerChime: 'chime1' | 'chime2' | 'chime3' | 'mute';
  notifications: boolean;
  lowStockThreshold: number;
}

export interface CommunityRecipe {
  id: string;
  presetId: string;
  name: string;
  teaType: TeaType;
  parameters: BrewParameters;
  archetypeBadgeId: string;
  upvotes: number;
  createdAt: string;
}

export type OfflineOperationType =
  | 'CREATE_BREW_LOG'
  | 'UPDATE_INVENTORY'
  | 'CREATE_PRESET'
  | 'UPDATE_PRESET'
  | 'DELETE_PRESET'
  | 'CREATE_CURVE'
  | 'UPDATE_CURVE'
  | 'DELETE_CURVE'
  | 'UPDATE_BADGES'
  | 'UPDATE_SETTINGS'
  | 'UPVOTE_RECIPE';

export interface OfflineOperation {
  id: string;
  type: OfflineOperationType;
  payload: unknown;
  timestamp: number;
  retryCount: number;
}

export interface RecipeHashPayload {
  v: number;
  n: string; // name
  t: TeaType; // tea type
  T: number; // temp
  s: number; // time sec
  r: number; // leaf mass
  w: number; // water volume
  c: number; // steep count
  d: number; // tds
  a: number; // altitude
  l: number; // leaf size
}

export interface TimerPreset {
  label: string;
  seconds: number;
}
