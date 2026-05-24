import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: exerciseId } = await params;

  // Last completed session that included this exercise
  const lastSession = await prisma.workoutSession.findFirst({
    where: {
      userId: "default-user",
      completedAt: { not: null },
      sets: { some: { exerciseId, isWarmup: false } },
    },
    orderBy: { completedAt: "desc" },
    include: {
      sets: {
        where: { exerciseId, isWarmup: false },
        orderBy: { setNumber: "asc" },
        select: { weightKg: true, reps: true, rir: true },
      },
    },
  });

  return NextResponse.json({ sets: lastSession?.sets ?? [] });
}
