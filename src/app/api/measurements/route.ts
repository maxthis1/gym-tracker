import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const measurement = await prisma.bodyMeasurement.create({
    data: { userId: "default-user", ...body },
  });
  return NextResponse.json({ measurement });
}

export async function GET() {
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId: "default-user" },
    orderBy: { date: "desc" },
    take: 30,
  });
  return NextResponse.json({ measurements });
}
