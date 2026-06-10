import { TeaState } from './TeaState';

const STORAGE_KEY = 'mobrew_state';

interface PersistedState {
  currentTemp: number;
  timestamp: number;
}

export class PersistenceManager {
  static save(state: TeaState): void {
    const data: PersistedState = {
      currentTemp: state.currentTemp,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  static load(): PersistedState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as PersistedState;
      // Validate max age: 30 minutes
      if (Date.now() - data.timestamp > 30 * 60 * 1000) return null;
      return data;
    } catch {
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
