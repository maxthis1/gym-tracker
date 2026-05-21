"use client";

import { useWorkoutStore } from "@/store/workout-store";
import { Play, Dumbbell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function ResumeSessionBanner() {
  // Avoid hydration mismatch: only render after client-side mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { sessionId, templateName, exercises, isFinished } = useWorkoutStore();

  if (!mounted) return null;
  if (!sessionId || isFinished || exercises.length === 0) return null;

  const doneCount = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.status === "done").length,
    0
  );
  const totalCount = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <Link href={`/workout/${sessionId}`} className="block px-4">
      <div className="relative overflow-hidden rounded-2xl border border-brand/40 bg-brand/10 px-4 py-3 flex items-center gap-3">
        {/* Progress bar background */}
        <div
          className="absolute inset-0 bg-brand/10 origin-left transition-all duration-500"
          style={{ transform: `scaleX(${pct / 100})` }}
        />

        {/* Icon */}
        <div className="relative shrink-0 w-9 h-9 rounded-xl bg-brand/20 flex items-center justify-center">
          <Dumbbell size={16} className="text-brand" />
        </div>

        {/* Text */}
        <div className="relative flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{templateName}</p>
          <p className="text-xs text-muted-foreground">
            {doneCount}/{totalCount} séries · {pct}%
          </p>
        </div>

        {/* Play button */}
        <div className="relative shrink-0 w-9 h-9 rounded-xl bg-brand flex items-center justify-center">
          <Play size={15} className="text-brand-foreground fill-brand-foreground ml-0.5" />
        </div>
      </div>
    </Link>
  );
}
