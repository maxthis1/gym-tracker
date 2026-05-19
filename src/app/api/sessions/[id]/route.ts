import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { completedAt, durationMinutes, notes, energyLevel, bodyweightKg } = body;

  const session = await prisma.workoutSession.update({
    where: { id },
    data: {
      completedAt: completedAt ? new Date(completedAt) : undefined,
      durationMinutes: durationMinutes ?? undefined,
      notes: notes ?? undefined,
      energyLevel: energyLevel ?? undefined,
      bodyweightKg: bodyweightKg ?? undefined,
    },
  });

  return NextResponse.json({ session });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Supprimer les séries d'abord (contrainte FK), puis la séance
  await prisma.exerciseSet.deleteMany({ where: { workoutSessionId: id } });
  await prisma.workoutSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
