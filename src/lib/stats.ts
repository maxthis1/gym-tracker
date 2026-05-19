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
