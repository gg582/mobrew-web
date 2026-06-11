import type { BrewParameters } from '@/domain/appTypes';

const KEY = 'mobrew_advanced_prefill';

export function setAdvancedPrefill(params: Partial<BrewParameters> & { steepTimeSec?: number; teaName?: string }) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(params));
  } catch {}
}

export function getAdvancedPrefill(): (Partial<BrewParameters> & { steepTimeSec?: number; teaName?: string }) | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAdvancedPrefill() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}
