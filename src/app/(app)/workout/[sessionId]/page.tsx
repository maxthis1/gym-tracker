export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkoutSession } from "@/components/workout/workout-session";
import { buildExerciseState } from "@/lib/build-exercise-state";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function WorkoutSessionPage({ params }: Props) {
  const { sessionId } = await params;

  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      template: {
        include: {
          exercises: {
            orderBy: { orderIndex: "asc" },
            include: { exercise: true },
          },
        },
      },
    },
  });

  if (!session || !session.template) notFound();

  // Fetch last session of the same template for pre-fill
  const lastSession = await prisma.workoutSession.findFirst({
    where: {
      userId: "default-user",
      workoutTemplateId: session.workoutTemplateId,
      completedAt: { not: null },
      id: { not: sessionId },
    },
    orderBy: { date: "desc" },
    include: { sets: { orderBy: { setNumber: "asc" } } },
  });

  // Build exercise state with pre-filled suggestions
  const exercises = session.template.exercises.map((te) => {
    const lastSets = lastSession
      ? lastSession.sets
          .filter((s) => s.exerciseId === te.exerciseId && !s.isWarmup)
          .map((s) => ({ weightKg: s.weightKg, reps: s.reps, rir: s.rir }))
      : [];
    return buildExerciseState(te, lastSets);
  });

  return (
    <WorkoutSession
      sessionId={sessionId}
      templateId={session.template.id}
      templateName={session.template.name}
      exercises={exercises}
    />
  );
}
