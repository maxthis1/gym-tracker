export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { prisma } from "@/lib/prisma";
import { ExerciseList } from "@/components/exercises/exercise-list";

export default async function ExercisesPage() {
  const exercises = await prisma.exercise.findMany({
    orderBy: [{ primaryMuscle: "asc" }, { nameFr: "asc" }],
    select: {
      id: true,
      nameFr: true,
      primaryMuscle: true,
      equipment: true,
      category: true,
    },
  });

  return (
    <div className="pb-6">
      <PageHeader
        title="Exercices"
        subtitle={`${exercises.length} exercices disponibles`}
      />
      <ExerciseList exercises={exercises} />
    </div>
  );
}
