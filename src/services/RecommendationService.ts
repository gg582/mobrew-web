import {
  getRecommendation as getRec,
  TASTE_OPTIONS,
  MOOD_OPTIONS,
  CAFFEINE_OPTIONS,
  type TasteProfile,
  type MoodGoal,
  type CaffeinePref,
} from '@/data/recommendations';
import type { RecommendationResult } from '@/data/recommendations';

export class RecommendationService {
  static getRecommendation(
    taste: TasteProfile,
    mood: MoodGoal,
    caffeine: CaffeinePref
  ): RecommendationResult {
    return getRec(taste, mood, caffeine);
  }

  static getTasteOptions() {
    return TASTE_OPTIONS;
  }

  static getMoodOptions() {
    return MOOD_OPTIONS;
  }

  static getCaffeineOptions() {
    return CAFFEINE_OPTIONS;
  }
}
