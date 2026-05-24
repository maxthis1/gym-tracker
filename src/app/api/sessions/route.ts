import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { templateId, bodyweightKg, energyLevel, sleepHours, stressLevel } = body;

  const session = await prisma.workoutSession.create({
    data: {
      userId: "default-user",
      workoutTemplateId: templateId ?? null,
      bodyweightKg: bodyweightKg ?? null,
      energyLevel: energyLevel ?? null,
      sleepHours: sleepHours ?? null,
      stressLevel: stressLevel ?? null,
    },
  });

  return NextResponse.json({ sessionId: session.id });
}
