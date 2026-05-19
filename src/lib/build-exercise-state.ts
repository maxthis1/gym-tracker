import { suggestNextWeight } from "@/lib/fitness";
import type { ExerciseState, LocalSet, SetStatus } from "@/store/workout-store";

export function buildExerciseState(
  te: {
    id: string;
    exerciseId: string;
    targetSets: number;
    targetRepsMin: number;
    targetRepsMax: number;
    targetRir: number;
    restSeconds: number;
    notes: string;
    exercise: {
      nameFr: string;
      equipment: string;
      primaryMuscle: string;
      secondaryMuscles: string;
    };
  },
  lastSets: Array<{ weightKg: number; reps: number; rir: number | null }>
): ExerciseState {
  const lastWorkingSets = lastSets.filter((s) => s.weightKg > 0);
  let suggestedWeight = 20;
  let suggestedReps = te.targetRepsMin;

  if (lastWorkingSets.length > 0) {
    const last = lastWorkingSets[lastWorkingSets.length - 1];
    suggestedWeight = suggestNextWeight(
      last.weightKg,
      last.reps,
      te.targetRepsMin,
      te.targetRepsMax,
      te.targetRir,
      last.rir,
      te.exercise.equipment
    );
    suggestedReps = te.targetRepsMin;
  }

  const sets: LocalSet[] = Array.from({ length: te.targetSets }, (_, i) => ({
    localId: `${te.id}-set-${i + 1}`,
    setNumber: i + 1,
    weightKg: suggestedWeight,
    reps: suggestedReps,
    rir: te.targetRir,
    isWarmup: false,
    isFailure: false,
    status: "pending" as SetStatus,
  }));

  return {
    templateExerciseId: te.id,
    exerciseId: te.exerciseId,
    nameFr: te.exercise.nameFr,
    equipment: te.exercise.equipment,
    primaryMuscle: te.exercise.primaryMuscle,
    secondaryMuscles: (() => {
      try { return JSON.parse(te.exercise.secondaryMuscles) as string[]; }
      catch { return []; }
    })(),
    targetSets: te.targetSets,
    targetRepsMin: te.targetRepsMin,
    targetRepsMax: te.targetRepsMax,
    targetRir: te.targetRir,
    restSeconds: te.restSeconds,
    notes: te.notes,
    sets,
    suggestedWeight,
    suggestedReps,
  };
}
