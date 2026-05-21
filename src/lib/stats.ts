import { prisma } from "@/lib/prisma";

const USER_ID = "default-user";

/** Monday of the week containing `date` */
function weekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Sunday (end) of the week containing `date` */
function weekEnd(date: Date): Date {
  const start = weekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export async function getWeekStats(referenceDate = new Date()) {
  const start = weekStart(referenceDate);
  const end = weekEnd(referenceDate);

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId: USER_ID,
      completedAt: { not: null, gte: start, lte: end },
    },
    include: {
      sets: { where: { isWarmup: false } },
      template: true,
    },
    orderBy: { date: "desc" },
  });

  const volume = sessions.reduce(
    (acc, s) => acc + s.sets.reduce((a, set) => a + set.weightKg * set.reps, 0),
    0
  );

  return { sessions, volume, count: sessions.length };
}

export async function getStreak(): Promise<number> {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId: USER_ID, completedAt: { not: null } },
    select: { completedAt: true },
    orderBy: { completedAt: "desc" },
  });

  if (sessions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const trainingDays = new Set(
    sessions.map((s) => {
      const d = new Date(s.completedAt!);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  let streak = 0;
  const cursor = new Date(today);

  // Allow today or yesterday as the starting point
  if (!trainingDays.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!trainingDays.has(cursor.getTime())) return 0;
  }

  while (trainingDays.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export async function getLastSession() {
  return prisma.workoutSession.findFirst({
    where: { userId: USER_ID, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    include: {
      template: true,
      sets: { where: { isWarmup: false }, orderBy: { createdAt: "asc" } },
    },
  });
}

/** Volume par muscle primaire sur les 7 derniers jours */
export async function getWeekMuscleVolume(): Promise<Record<string, number>> {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const sets = await prisma.exerciseSet.findMany({
    where: {
      session: { userId: USER_ID, completedAt: { not: null, gte: since } },
      isWarmup: false,
    },
    include: { exercise: { select: { primaryMuscle: true } } },
  });

  const vol: Record<string, number> = {};
  for (const s of sets) {
    const m = s.exercise.primaryMuscle;
    vol[m] = (vol[m] ?? 0) + s.weightKg * s.reps;
  }
  return vol;
}

export async function getAllSessions() {
  return prisma.workoutSession.findMany({
    where: { userId: USER_ID, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    include: {
      template: true,
      sets: { where: { isWarmup: false } },
    },
  });
}

export async function getAllTimeStats() {
  const [sessions, sets, prs] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId: USER_ID, completedAt: { not: null } },
      select: { durationMinutes: true, completedAt: true },
    }),
    prisma.exerciseSet.findMany({
      where: { session: { userId: USER_ID, completedAt: { not: null } }, isWarmup: false },
      select: { weightKg: true, reps: true, exerciseId: true },
    }),
    prisma.personalRecord.findMany({
      where: { userId: USER_ID, recordType: "1RM" },
      orderBy: { value: "desc" },
      take: 5,
      include: { exercise: { select: { nameFr: true } } },
    }),
  ]);

  const totalVolume = sets.reduce((acc, s) => acc + s.weightKg * s.reps, 0);
  const totalSessions = sessions.length;
  const totalDurationMins = sessions.reduce((acc, s) => acc + (s.durationMinutes ?? 0), 0);
  const uniqueExercises = new Set(sets.map((s) => s.exerciseId)).size;

  // Heaviest single set
  const heaviest = sets.reduce(
    (best, s) => (s.weightKg > best.weightKg ? s : best),
    { weightKg: 0, reps: 0, exerciseId: "" }
  );

  // Longest streak
  const trainingDays = Array.from(
    new Set(sessions.map((s) => new Date(s.completedAt!).toISOString().slice(0, 10)))
  ).sort();

  let longestStreak = 0;
  let currentStreak = 1;
  for (let i = 1; i < trainingDays.length; i++) {
    const prev = new Date(trainingDays[i - 1]);
    const curr = new Date(trainingDays[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  if (trainingDays.length === 1) longestStreak = 1;

  return { totalVolume, totalSessions, totalDurationMins, uniqueExercises, heaviest, longestStreak, topPRs: prs };
}

export async function getSessionDetail(sessionId: string) {
  return prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      template: {
        include: {
          exercises: { orderBy: { orderIndex: "asc" }, include: { exercise: true } },
        },
      },
      sets: { orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }], include: { exercise: true } },
    },
  });
}
