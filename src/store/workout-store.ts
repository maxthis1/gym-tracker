"use client";

import { create } from "zustand";
import { suggestNextWeight, formatWeight } from "@/lib/fitness";

export type SetStatus = "pending" | "done" | "failed";

export interface LocalSet {
  localId: string;
  dbId?: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  rir: number;
  isWarmup: boolean;
  isFailure: boolean;
  status: SetStatus;
}

export interface ExerciseState {
  templateExerciseId: string;
  exerciseId: string;
  nameFr: string;
  equipment: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRir: number;
  restSeconds: number;
  notes: string;
  sets: LocalSet[];
  // pre-computed suggestion from last session
  suggestedWeight: number;
  suggestedReps: number;
}

interface RestTimer {
  active: boolean;
  remaining: number;
  total: number;
  label: string;
}

interface WorkoutStore {
  sessionId: string | null;
  templateName: string;
  startedAt: Date | null;
  exercises: ExerciseState[];
  restTimer: RestTimer;
  isFinished: boolean;

  initSession: (sessionId: string, templateName: string, exercises: ExerciseState[]) => void;
  updateSetField: (
    exIdx: number,
    setIdx: number,
    field: keyof Pick<LocalSet, "weightKg" | "reps" | "rir">,
    value: number
  ) => void;
  validateSet: (exIdx: number, setIdx: number, sessionId: string) => void;
  failSet: (exIdx: number, setIdx: number, sessionId: string) => void;
  addSet: (exIdx: number) => void;
  startRestTimer: (seconds: number, label: string) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  finishSession: () => void;
}

let _timerInterval: ReturnType<typeof setInterval> | null = null;

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  sessionId: null,
  templateName: "",
  startedAt: null,
  exercises: [],
  restTimer: { active: false, remaining: 0, total: 0, label: "" },
  isFinished: false,

  initSession(sessionId, templateName, exercises) {
    set({ sessionId, templateName, startedAt: new Date(), exercises, isFinished: false });
  },

  updateSetField(exIdx, setIdx, field, value) {
    set((state) => {
      const exercises = structuredClone(state.exercises);
      exercises[exIdx].sets[setIdx][field] = value;
      return { exercises };
    });
  },

  validateSet(exIdx, setIdx, sessionId) {
    const state = get();
    const ex = state.exercises[exIdx];
    const s = ex.sets[setIdx];
    if (s.status !== "pending") return;

    // Persist to DB (fire-and-forget, errors silently ignored for offline resilience)
    fetch(`/api/sessions/${sessionId}/sets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: ex.exerciseId,
        setNumber: s.setNumber,
        weightKg: s.weightKg,
        reps: s.reps,
        rir: s.rir,
        isWarmup: s.isWarmup,
        isFailure: false,
        notes: "",
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.set?.id) {
          set((state) => {
            const exercises = structuredClone(state.exercises);
            exercises[exIdx].sets[setIdx].dbId = data.set.id;
            return { exercises };
          });
        }
      })
      .catch(() => {}); // offline — will sync later

    set((state) => {
      const exercises = structuredClone(state.exercises);
      const currentSet = exercises[exIdx].sets[setIdx];
      currentSet.status = "done";

      // Pre-fill next set if it's pending
      const nextSet = exercises[exIdx].sets[setIdx + 1];
      if (nextSet && nextSet.status === "pending") {
        nextSet.weightKg = currentSet.weightKg;
        nextSet.reps = currentSet.reps;
        nextSet.rir = currentSet.rir;
      }

      return { exercises };
    });

    // Start rest timer
    get().startRestTimer(ex.restSeconds, ex.nameFr);

    // Vibrate
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  },

  failSet(exIdx, setIdx, sessionId) {
    const state = get();
    const ex = state.exercises[exIdx];
    const s = ex.sets[setIdx];
    if (s.status !== "pending") return;

    fetch(`/api/sessions/${sessionId}/sets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: ex.exerciseId,
        setNumber: s.setNumber,
        weightKg: s.weightKg,
        reps: s.reps,
        rir: s.rir,
        isWarmup: false,
        isFailure: true,
      }),
    }).catch(() => {});

    set((state) => {
      const exercises = structuredClone(state.exercises);
      exercises[exIdx].sets[setIdx].status = "failed";
      return { exercises };
    });

    get().startRestTimer(ex.restSeconds, ex.nameFr);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([200]);
    }
  },

  addSet(exIdx) {
    set((state) => {
      const exercises = structuredClone(state.exercises);
      const ex = exercises[exIdx];
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSetNumber = lastSet ? lastSet.setNumber + 1 : 1;
      ex.sets.push({
        localId: `local-${Date.now()}`,
        setNumber: newSetNumber,
        weightKg: lastSet?.weightKg ?? ex.suggestedWeight,
        reps: lastSet?.reps ?? ex.targetRepsMin,
        rir: ex.targetRir,
        isWarmup: false,
        isFailure: false,
        status: "pending",
      });
      return { exercises };
    });
  },

  startRestTimer(seconds, label) {
    if (_timerInterval) clearInterval(_timerInterval);
    set({ restTimer: { active: true, remaining: seconds, total: seconds, label } });
    _timerInterval = setInterval(() => {
      const { restTimer } = get();
      if (restTimer.remaining <= 1) {
        clearInterval(_timerInterval!);
        _timerInterval = null;
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([300, 100, 300, 100, 300]);
        }
        set({ restTimer: { active: false, remaining: 0, total: restTimer.total, label: "" } });
      } else {
        set((state) => ({
          restTimer: { ...state.restTimer, remaining: state.restTimer.remaining - 1 },
        }));
      }
    }, 1000);
  },

  tickTimer() {},

  stopTimer() {
    if (_timerInterval) {
      clearInterval(_timerInterval);
      _timerInterval = null;
    }
    set({ restTimer: { active: false, remaining: 0, total: 0, label: "" } });
  },

  finishSession() {
    if (_timerInterval) {
      clearInterval(_timerInterval);
      _timerInterval = null;
    }
    set({ isFinished: true });
  },
}));

// Build initial exercise state from server data
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
      secondaryMuscles?: string;
    };
  },
  lastSets: Array<{ weightKg: number; reps: number; rir: number | null }>
): ExerciseState {
  const targetSets = te.targetSets;

  // Suggest weight: if last session had enough sets and hit the target, bump up
  const lastWorkingSets = lastSets.filter((s) => s.weightKg > 0);
  let suggestedWeight = 20; // default barbell start
  let suggestedReps = te.targetRepsMin;

  if (lastWorkingSets.length > 0) {
    const lastWeight = lastWorkingSets[lastWorkingSets.length - 1].weightKg;
    const lastReps = lastWorkingSets[lastWorkingSets.length - 1].reps;
    const lastRir = lastWorkingSets[lastWorkingSets.length - 1].rir;
    suggestedWeight = suggestNextWeight(
      lastWeight,
      lastReps,
      te.targetRepsMin,
      te.targetRepsMax,
      te.targetRir,
      lastRir,
      te.exercise.equipment
    );
    suggestedReps = te.targetRepsMin;
  }

  // Build set slots pre-filled with suggestion
  const sets: LocalSet[] = Array.from({ length: targetSets }, (_, i) => ({
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
      try { return JSON.parse(te.exercise.secondaryMuscles ?? "[]") as string[]; }
      catch { return []; }
    })(),
    targetSets,
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
