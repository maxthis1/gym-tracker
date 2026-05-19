"use client";

import { useEffect, useState } from "react";
import { useWorkoutStore, ExerciseState } from "@/store/workout-store";
import { ExerciseCard } from "./exercise-card";
import { RestTimer } from "./rest-timer";
import { FinishModal } from "./finish-modal";
import { CoachBriefing } from "./coach-briefing";
import { Button } from "@/components/ui/button";
import { Flag, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { formatDuration } from "@/lib/fitness";
import { useRouter } from "next/navigation";

interface WorkoutSessionProps {
  sessionId: string;
  templateId: string;
  templateName: string;
  exercises: ExerciseState[];
}

export function WorkoutSession({ sessionId, templateId, templateName, exercises }: WorkoutSessionProps) {
  const { initSession, exercises: storeExercises, startedAt, restTimer } = useWorkoutStore();
  const [showFinish, setShowFinish] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const router = useRouter();

  // Init store on mount (only once)
  useEffect(() => {
    initSession(sessionId, templateName, exercises);
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (startedAt) {
        setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const elapsedMins = Math.floor(elapsed / 60);
  const elapsedSecs = elapsed % 60;
  const elapsedStr = `${elapsedMins}:${elapsedSecs.toString().padStart(2, "0")}`;

  const doneSetCount = storeExercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.status === "done").length,
    0
  );
  const totalSetCount = storeExercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <div className="min-h-full pb-8">
      {/* Rest timer banner (sticky top) */}
      <RestTimer />

      {/* Header */}
      <div
        className={restTimer.active ? "pt-16" : "pt-0"}
        style={{ transition: "padding-top 0.2s" }}
      >
        <div className="flex items-center gap-2 px-4 pt-4 pb-1">
          <Link href="/workout/new" className="flex items-center gap-1 text-muted-foreground text-sm shrink-0">
            <ChevronLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate">{templateName}</h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="tabular-nums">{elapsedStr}</span>
              <span>{doneSetCount}/{totalSetCount} séries</span>
            </div>
          </div>
          <Button
            onClick={() => setShowFinish(true)}
            className="shrink-0 h-9 px-3 text-xs rounded-xl bg-brand text-brand-foreground hover:bg-brand/90 gap-1.5"
          >
            <Flag size={13} />
            Finir
          </Button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted mx-4 mt-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-500"
            style={{ width: totalSetCount > 0 ? `${(doneSetCount / totalSetCount) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Coach briefing */}
      <CoachBriefing templateId={templateId} templateName={templateName} />

      {/* Exercise list */}
      <div className="px-3 mt-3 space-y-3">
        {storeExercises.map((ex, exIdx) => (
          <ExerciseCard
            key={ex.templateExerciseId}
            exercise={ex}
            exIdx={exIdx}
            sessionId={sessionId}
          />
        ))}
      </div>

      {/* Finish modal */}
      {startedAt && (
        <FinishModal
          open={showFinish}
          onOpenChange={setShowFinish}
          sessionId={sessionId}
          startedAt={startedAt}
        />
      )}
    </div>
  );
}
