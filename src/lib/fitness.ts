/** Estimate 1RM using Epley formula (falls back to Brzycki for low reps) */
export function estimate1RM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  if (reps <= 10) {
    // Brzycki: more accurate for low reps
    return weightKg * (36 / (37 - reps));
  }
  // Epley: better for higher rep ranges
  return weightKg * (1 + reps / 30);
}

/** Volume of a single set */
export function setVolume(weightKg: number, reps: number): number {
  return weightKg * reps;
}

/** Convert RIR to approximate RPE */
export function rirToRpe(rir: number): number {
  return Math.min(10, 10 - rir);
}

/** Relative intensity: weight used vs estimated 1RM */
export function relativeIntensity(weightKg: number, reps: number, oneRM: number): number {
  if (oneRM === 0) return 0;
  const used1RM = estimate1RM(weightKg, reps);
  return used1RM / oneRM;
}

/** Weekly volume for a muscle = sum of working sets (RIR <= 3) × reps */
export function weeklyVolumeForMuscle(
  sets: Array<{ weightKg: number; reps: number; rir: number | null; isWarmup: boolean }>
): number {
  return sets
    .filter((s) => !s.isWarmup && (s.rir === null || s.rir <= 3))
    .reduce((acc, s) => acc + setVolume(s.weightKg, s.reps), 0);
}

/** Relative progress vs 4 weeks ago: (current - past) / past */
export function relativeProgress(current1RM: number, past1RM: number): number {
  if (past1RM === 0) return 0;
  return (current1RM - past1RM) / past1RM;
}

/** Suggest next weight given current weight, success rate, and target RIR */
export function suggestNextWeight(
  lastWeight: number,
  lastReps: number,
  targetRepsMin: number,
  targetRepsMax: number,
  targetRir: number,
  lastRir: number | null,
  equipment: string
): number {
  const increment = equipment === "barbell" ? 2.5 : 1.25;
  const hitTarget =
    lastReps >= targetRepsMax &&
    (lastRir === null || lastRir <= targetRir);

  if (hitTarget) {
    return Math.round((lastWeight + increment) / increment) * increment;
  }
  return lastWeight;
}

/** Format duration in minutes to a readable string */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, "0")}`;
}

/** Format weight: show 1 decimal only if needed */
export function formatWeight(kg: number): string {
  return Number.isInteger(kg) ? `${kg}` : kg.toFixed(1);
}
