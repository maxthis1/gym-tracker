"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { suggestNextWeight } from "@/lib/fitness";
import { toast } from "sonner";

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

// ── Warmup state ─────────────────────────────────────────────────────────────
export interface WarmupBodySet {
  reps: number;
  done: boolean;
}

export interface WarmupExercise {
  id: string;        // e.g. "tractions" | "dips"
  name: string;
  sets: WarmupBodySet[];
}

export interface WarmupState {
  runningKm: number;
  runningDone: boolean;
  exercises: WarmupExercise[];
}

const DEFAULT_WARMUP: WarmupState = {
  runningKm: 0,
  runningDone: false,
  exercises: [
    { id: "tractions", name: "Tractions", sets: [{ reps: 5, done: false }, { reps: 5, done: false }] },
    { id: "dips",      name: "Dips",      sets: [{ reps: 8, done: false }, { reps: 8, done: false }] },
  ],
};

interface PendingSet {
  sessionId: string;
  exIdx: number;
  setIdx: number;
  payload: {
    exerciseId: string;
    setNumber: number;
    weightKg: number;
    reps: number;
    rir: number;
    isWarmup: boolean;
    isFailure: boolean;
    notes: string;
  };
}

interface WorkoutStore {
  sessionId: string | null;
  templateName: string;
  startedAt: Date | null;
  exercises: ExerciseState[];
  restTimer: RestTimer;
  isFinished: boolean;
  warmup: WarmupState;
  pendingSets: PendingSet[];

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
  addRestTime: (seconds: number) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  finishSession: () => void;
  // Warmup actions
  setRunningKm: (km: number) => void;
  toggleRunningDone: () => void;
  updateWarmupReps: (exIdx: number, setIdx: number, reps: number) => void;
  toggleWarmupSet: (exIdx: number, setIdx: number) => void;
  addWarmupSet: (exIdx: number) => void;
  // Offline sync
  syncPendingSets: () => Promise<void>;
}

let _timerInterval: ReturnType<typeof setInterval> | null = null;

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      sessionId: null,
      templateName: "",
      startedAt: null,
      exercises: [],
      restTimer: { active: false, remaining: 0, total: 0, label: "" },
      isFinished: false,
      warmup: DEFAULT_WARMUP,
      pendingSets: [],

      initSession(sessionId, templateName, exercises) {
        const state = get();
        // Resume in-progress session — do NOT overwrite existing progress
        if (
          state.sessionId === sessionId &&
          state.exercises.length > 0 &&
          !state.isFinished
        ) {
          return;
        }
        // Fresh session or different session
        set({
          sessionId,
          templateName,
          startedAt: new Date(),
          exercises,
          isFinished: false,
          restTimer: { active: false, remaining: 0, total: 0, label: "" },
          warmup: DEFAULT_WARMUP,
        });
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

        // Persist to DB
        const payload = {
          exerciseId: ex.exerciseId,
          setNumber: s.setNumber,
          weightKg: s.weightKg,
          reps: s.reps,
          rir: s.rir,
          isWarmup: s.isWarmup,
          isFailure: false,
          notes: "",
        };
        fetch(`/api/sessions/${sessionId}/sets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
            if (data.isPR) {
              const exName = get().exercises[exIdx]?.nameFr ?? "";
              toast.success("🏆 Nouveau PR !", {
                description: `${exName} — meilleur 1RM estimé`,
                duration: 4000,
              });
            }
          })
          .catch(() => {
            // Offline — queue for later sync
            set((state) => ({
              pendingSets: [...state.pendingSets, { sessionId, exIdx, setIdx, payload }],
            }));
          });

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

      addRestTime(seconds) {
        set((state) => ({
          restTimer: {
            ...state.restTimer,
            remaining: Math.max(0, state.restTimer.remaining + seconds),
            total: Math.max(state.restTimer.total, state.restTimer.remaining + seconds),
          },
        }));
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

      // ── Offline sync ────────────────────────────────────────────────────────
      async syncPendingSets() {
        const { pendingSets } = get();
        if (pendingSets.length === 0) return;

        const remaining: PendingSet[] = [];
        for (const pending of pendingSets) {
          try {
            const r = await fetch(`/api/sessions/${pending.sessionId}/sets`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(pending.payload),
            });
            if (!r.ok) throw new Error("server error");
            const data = await r.json();
            if (data.set?.id) {
              set((state) => {
                const exercises = structuredClone(state.exercises);
                const ex = exercises[pending.exIdx];
                if (ex?.sets[pending.setIdx]) {
                  ex.sets[pending.setIdx].dbId = data.set.id;
                }
                return { exercises };
              });
            }
          } catch {
            remaining.push(pending);
          }
        }
        set({ pendingSets: remaining });
        if (remaining.length === 0 && pendingSets.length > 0) {
          toast.success("Synchronisation OK", { description: `${pendingSets.length} série(s) sauvegardée(s)` });
        }
      },

      // ── Warmup actions ──────────────────────────────────────────────────────
      setRunningKm(km) {
        set((state) => ({ warmup: { ...state.warmup, runningKm: km } }));
      },

      toggleRunningDone() {
        set((state) => ({ warmup: { ...state.warmup, runningDone: !state.warmup.runningDone } }));
      },

      updateWarmupReps(exIdx, setIdx, reps) {
        set((state) => {
          const exercises = structuredClone(state.warmup.exercises);
          exercises[exIdx].sets[setIdx].reps = reps;
          return { warmup: { ...state.warmup, exercises } };
        });
      },

      toggleWarmupSet(exIdx, setIdx) {
        set((state) => {
          const exercises = structuredClone(state.warmup.exercises);
          exercises[exIdx].sets[setIdx].done = !exercises[exIdx].sets[setIdx].done;
          return { warmup: { ...state.warmup, exercises } };
        });
      },

      addWarmupSet(exIdx) {
        set((state) => {
          const exercises = structuredClone(state.warmup.exercises);
          const lastSet = exercises[exIdx].sets[exercises[exIdx].sets.length - 1];
          exercises[exIdx].sets.push({ reps: lastSet?.reps ?? 5, done: false });
          return { warmup: { ...state.warmup, exercises } };
        });
      },
    }),
    {
      name: "gym-workout-session",
      // Only persist session data — not the rest timer (it resets anyway)
      partialize: (state) => ({
        sessionId: state.sessionId,
        templateName: state.templateName,
        startedAt: state.startedAt,
        exercises: state.exercises,
        isFinished: state.isFinished,
        warmup: state.warmup,
        pendingSets: state.pendingSets,
      }),
      // Re-hydrate startedAt as a real Date (localStorage stores it as a string)
      onRehydrateStorage: () => (state) => {
        if (state?.startedAt) {
          state.startedAt = new Date(state.startedAt as unknown as string);
        }
      },
    }
  )
);

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
