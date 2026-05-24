import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const exercises = await prisma.exercise.findMany({
    orderBy: [{ primaryMuscle: "asc" }, { nameFr: "asc" }],
    select: {
      id: true,
      nameFr: true,
      primaryMuscle: true,
      secondaryMuscles: true,
      equipment: true,
      category: true,
    },
  });
  return NextResponse.json({ exercises });
}
