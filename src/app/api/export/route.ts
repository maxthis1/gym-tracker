import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: convert array of objects to CSV string
function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val == null) return "";
          const str = String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    ),
  ];
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "json"; // "json" | "csv"
  const type = searchParams.get("type") ?? "sessions"; // "sessions" | "measurements"

  if (type === "measurements") {
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { userId: "default-user" },
      orderBy: { date: "asc" },
    });

    const rows = measurements.map((m) => ({
      date: m.date.toISOString().split("T")[0],
      weightKg: m.weightKg ?? "",
      bodyFatPct: m.bodyFatPct ?? "",
      neckCm: m.neckCm ?? "",
      chestCm: m.chestCm ?? "",
      waistCm: m.waistCm ?? "",
      hipsCm: m.hipsCm ?? "",
      bicepLeftCm: m.bicepLeftCm ?? "",
      bicepRightCm: m.bicepRightCm ?? "",
      thighLeftCm: m.thighLeftCm ?? "",
      thighRightCm: m.thighRightCm ?? "",
      notes: m.notes ?? "",
    }));

    if (format === "csv") {
      return new NextResponse(toCSV(rows), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="measurements.csv"`,
        },
      });
    }
    return new NextResponse(JSON.stringify(rows, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="measurements.json"`,
      },
    });
  }

  // Sessions + sets
  const sessions = await prisma.workoutSession.findMany({
    where: { userId: "default-user", completedAt: { not: null } },
    orderBy: { date: "asc" },
    include: {
      template: { select: { name: true } },
      sets: {
        orderBy: { setNumber: "asc" },
        include: { exercise: { select: { name: true } } },
      },
    },
  });

  const rows = (sessions as any[]).flatMap((s: any) =>
    s.sets.map((set: any) => ({
      sessionDate: s.date.toISOString().split("T")[0],
      template: s.template?.name ?? "",
      exercise: set.exercise.name,
      setNumber: set.setNumber,
      isWarmup: set.isWarmup ? "true" : "false",
      weightKg: set.weightKg ?? "",
      reps: set.reps ?? "",
      rir: set.rir ?? "",
      rpe: set.rpe ?? "",
      isFailure: set.isFailure ? "true" : "false",
      durationMinutes: s.durationMinutes ?? "",
    }))
  );

  if (format === "csv") {
    return new NextResponse(toCSV(rows), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="sessions.csv"`,
      },
    });
  }
  return new NextResponse(JSON.stringify(rows, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="sessions.json"`,
    },
  });
}
