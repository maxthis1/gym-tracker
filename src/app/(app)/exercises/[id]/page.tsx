export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MuscleMap } from "@/components/exercises/muscle-map";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExercisePage({ params }: Props) {
  const { id } = await params;
  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) notFound();

  const secondaryMuscles: string[] = JSON.parse(exercise.secondaryMuscles);

  return (
    <div>
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Link href="/exercises" className="flex items-center gap-1 text-muted-foreground text-sm">
          <ChevronLeft size={18} /> Exercices
        </Link>
      </div>

      <div className="px-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{exercise.nameFr}</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {exercise.primaryMuscle.replace(/_/g, " ")} · {exercise.equipment}
          </p>
        </div>

        {exercise.gifUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={exercise.gifUrl}
            alt={exercise.nameFr}
            className="w-full max-w-xs mx-auto rounded-2xl"
          />
        )}

        {secondaryMuscles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {secondaryMuscles.map((m) => (
              <Badge key={m} variant="secondary" className="capitalize text-xs">
                {m.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        )}

        {/* Muscle map */}
        <Card className="p-4 border-border/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Muscles travaillés
          </p>
          <MuscleMap
            primaryMuscle={exercise.primaryMuscle}
            secondaryMuscles={secondaryMuscles}
          />
        </Card>

        {exercise.tipsFr && (
          <Card className="p-4 border-border/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Technique
            </p>
            <p className="text-sm leading-relaxed">{exercise.tipsFr}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
