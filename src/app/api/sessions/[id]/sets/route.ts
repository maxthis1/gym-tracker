import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { estimate1RM } from "@/lib/fitness";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const body = await req.json();
  const { exerciseId, setNumber, weightKg, reps, rir, isWarmup, isFailure, notes } = body;

  const set = await prisma.exerciseSet.create({
    data: {
      workoutSessionId: sessionId,
      exerciseId,
      setNumber,
      weightKg,
      reps,
      rir: rir ?? null,
      isWarmup: isWarmup ?? false,
      isFailure: isFailure ?? false,
      notes: notes ?? "",
    },
  });

  // Check for personal records (only working sets)
  if (!isWarmup && !isFailure) {
    const current1RM = estimate1RM(weightKg, reps);
    const bestRecord = await prisma.personalRecord.findFirst({
      where: { userId: "default-user", exerciseId, recordType: "1RM" },
      orderBy: { value: "desc" },
    });
    if (!bestRecord || current1RM > bestRecord.value) {
      await prisma.personalRecord.create({
        data: {
          userId: "default-user",
          exerciseId,
          recordType: "1RM",
          value: current1RM,
          sessionId,
        },
      });
    }
  }

  return NextResponse.json({ set });
}
