import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { templateId, bodyweightKg, energyLevel, sleepHours, stressLevel } = body;

  if (!templateId) {
    return NextResponse.json({ error: "templateId required" }, { status: 400 });
  }

  const session = await prisma.workoutSession.create({
    data: {
      userId: "default-user",
      workoutTemplateId: templateId,
      bodyweightKg: bodyweightKg ?? null,
      energyLevel: energyLevel ?? null,
      sleepHours: sleepHours ?? null,
      stressLevel: stressLevel ?? null,
    },
  });

  return NextResponse.json({ sessionId: session.id });
}
