import type { CustomCurve, CurvePhase } from '@/domain/appTypes';

export function totalDuration(phases: CurvePhase[]): number {
  return phases.reduce((sum, phase) => sum + (phase.durationSec || 0), 0);
}

export function interpolateTemperature(
  phases: CurvePhase[],
  elapsedSec: number,
  startTemp = 20
): number {
  if (phases.length === 0) return startTemp;

  let elapsed = Math.max(0, elapsedSec);
  let prevTemp = startTemp;

  for (const phase of phases) {
    const duration = phase.durationSec || 0;
    if (elapsed <= duration) {
      if (duration <= 0) return phase.targetTemp;
      return prevTemp + (phase.targetTemp - prevTemp) * (elapsed / duration);
    }
    elapsed -= duration;
    prevTemp = phase.targetTemp;
  }

  return prevTemp;
}

export function buildTemperatureAtTime(curve: CustomCurve, elapsedSec: number): number {
  return interpolateTemperature(curve.phases, elapsedSec, 20);
}
