"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Exercise { id: string; nameFr: string; muscle: string }

export function ExerciseSelector({ exercises }: { exercises: Exercise[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("ex") ?? exercises[0]?.id ?? "";

  return (
    <select
      value={current}
      onChange={(e) => router.push(`/progress?ex=${e.target.value}`, { scroll: false })}
      className="w-full bg-muted/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
    >
      {exercises.map((ex) => (
        <option key={ex.id} value={ex.id}>
          {ex.nameFr}
        </option>
      ))}
    </select>
  );
}
