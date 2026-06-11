import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/infrastructure/api/apiClient';
import { TeaType } from '@/domain/enums';
import type { BadgeDefinition, UserBadge, BrewLogEntry } from '@/domain/appTypes';
import { BADGE_DEFINITIONS, evaluateAfterBrew as evaluateBadges } from '@/services/badgeEngine';
import { useBrewLogStore } from './brewLogStore';

interface BadgeState {
  definitions: BadgeDefinition[];
  userBadges: UserBadge[];
  archetypeBadgeId: string | null;
  brewedTeaTypes: TeaType[];
  loading: boolean;
}

interface BadgeActions {
  loadDefinitions: () => Promise<void>;
  loadUserBadges: () => Promise<void>;
  updateProgress: (badgeId: string, progress: number) => Promise<void>;
  evaluateAfterBrew: (log: BrewLogEntry) => void;
}

type BadgeStore = BadgeState & BadgeActions;

function getIsLoggedIn() {
  return !!localStorage.getItem('mobrew_access_token');
}

function clampProgress(progress: number, max: number) {
  return Math.min(Math.max(progress, 0), max);
}

export const useBadgeStore = create<BadgeStore>()(
  persist(
    (set, get) => ({
      definitions: BADGE_DEFINITIONS,
      userBadges: [],
      archetypeBadgeId: null,
      brewedTeaTypes: [],
      loading: false,

      loadDefinitions: async () => {
        set({ loading: true });
        try {
          const res = await apiClient.get('/badges');
          set({ definitions: res.data?.definitions ?? res.data ?? [] });
        } finally {
          set({ loading: false });
        }
      },

      loadUserBadges: async () => {
        if (!getIsLoggedIn()) return;
        set({ loading: true });
        try {
          const res = await apiClient.get('/badges/user');
          set({
            userBadges: res.data?.badges ?? [],
            archetypeBadgeId: res.data?.archetypeBadgeId ?? null,
          });
        } finally {
          set({ loading: false });
        }
      },

      updateProgress: async (badgeId, progress) => {
        const { definitions, userBadges } = get();
        const def = definitions.find((d) => d.id === badgeId);
        if (!def) return;

        const max = def.maxProgress;
        const clamped = clampProgress(progress, max);
        const existing = userBadges.find((b) => b.badgeId === badgeId);
        const earned = clamped >= max;

        const nextBadges = existing
          ? userBadges.map((b) =>
              b.badgeId === badgeId
                ? {
                    ...b,
                    progress: clamped,
                    earnedAt: b.earnedAt ?? (earned ? new Date().toISOString() : undefined),
                  }
                : b
            )
          : [
              ...userBadges,
              {
                id: `${badgeId}_${Date.now()}`,
                badgeId,
                progress: clamped,
                earnedAt: earned ? new Date().toISOString() : undefined,
              },
            ];

        set({ userBadges: nextBadges });

        if (getIsLoggedIn()) {
          try {
            await apiClient.patch(`/badges/user/${badgeId}`, { progress: clamped });
          } catch {
            // keep local progress; server sync deferred
          }
        }
      },

      evaluateAfterBrew: (log) => {
        const history = useBrewLogStore
          .getState()
          .logs.filter((l) => l.id !== log.id);

        const { updatedBadges, archetypeBadgeId } = evaluateBadges(
          log,
          history,
          get().userBadges
        );

        set({ userBadges: updatedBadges, archetypeBadgeId });
      },
    }),
    {
      name: 'mobrew_badges',
      partialize: (state) => ({
        definitions: state.definitions,
        userBadges: state.userBadges,
        archetypeBadgeId: state.archetypeBadgeId,
        brewedTeaTypes: state.brewedTeaTypes,
      }),
    }
  )
);
