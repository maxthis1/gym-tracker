import { prisma } from "@/lib/prisma";
import { estimate1RM } from "@/lib/fitness";

const USER_ID = "default-user";

/** 1RM history for a given exercise over the last N weeks */
export async function get1RMHistory(exerciseId: string, weeks = 12) {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const sets = await prisma.exerciseSet.findMany({
    where: {
      session: { userId: USER_ID, completedAt: { not: null, gte: since } },
      exerciseId,
      isWarmup: false,
      reps: { gte: 1 },
    },
    include: { session: { select: { completedAt: true, date: true } } },
    orderBy: { session: { date: "asc" } },
  });

  // Group by session date, take best 1RM per session
  const bySession = new Map<string, number>();
  for (const s of sets) {
    const d = (s.session.completedAt ?? s.session.date).toISOString().slice(0, 10);
    const rm = estimate1RM(s.weightKg, s.reps);
    if (!bySession.has(d) || rm > bySession.get(d)!) bySession.set(d, rm);
  }

  return Array.from(bySession.entries())
    .map(([date, oneRM]) => ({ date, oneRM: Math.round(oneRM) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Weekly volume (kg) per primary muscle group over last N weeks */
export async function getWeeklyVolumeByMuscle(weeks = 8) {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const sets = await prisma.exerciseSet.findMany({
    where: {
      session: { userId: USER_ID, completedAt: { not: null, gte: since } },
      isWarmup: false,
    },
    include: {
      exercise: { select: { primaryMuscle: true } },
      session: { select: { completedAt: true, date: true } },
    },
  });

  // Group by ISO week key (YYYY-WNN) + muscle
  const data = new Map<string, Map<string, number>>();

  for (const s of sets) {
    const d = s.session.completedAt ?? s.session.date;
    const weekKey = getISOWeek(d);
    if (!data.has(weekKey)) data.set(weekKey, new Map());
    const muscle = s.exercise.primaryMuscle;
    const vol = s.weightKg * s.reps;
    data.get(weekKey)!.set(muscle, (data.get(weekKey)!.get(muscle) ?? 0) + vol);
  }

  // Convert to array sorted by week
  return Array.from(data.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, muscles]) => ({
      week: weekLabel(week),
      ...Object.fromEntries(muscles),
    }));
}

/** All exercises that have been trained */
export async function getTrainedExercises() {
  const rows = await prisma.exerciseSet.findMany({
    where: { session: { userId: USER_ID, completedAt: { not: null } }, isWarmup: false },
    select: { exerciseId: true, exercise: { select: { nameFr: true, primaryMuscle: true } } },
    distinct: ["exerciseId"],
    orderBy: { exercise: { nameFr: "asc" } },
  });
  return rows.map((r) => ({ id: r.exerciseId, nameFr: r.exercise.nameFr, muscle: r.exercise.primaryMuscle }));
}

function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${weekNum.toString().padStart(2, "0")}`;
}

function weekLabel(isoWeek: string): string {
  // "2026-W17" → "S17"
  const [, w] = isoWeek.split("-W");
  return `S${w}`;
}

/** Muscle color palette */
export const MUSCLE_COLORS: Record<string, string> = {
  chest: "#f97316",
  back: "#3b82f6",
  quads: "#22c55e",
  hamstrings: "#a855f7",
  glutes: "#ec4899",
  front_delt: "#f59e0b",
  lateral_delt: "#06b6d4",
  rear_delt: "#84cc16",
  triceps: "#ef4444",
  biceps: "#8b5cf6",
  calves: "#14b8a6",
  core: "#6b7280",
  traps: "#d97706",
};
