export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const categoryLabels: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  legs: "Jambes",
  core: "Core",
};

const categoryColors: Record<string, string> = {
  push: "bg-orange-500/15 text-orange-400",
  pull: "bg-blue-500/15 text-blue-400",
  legs: "bg-emerald-500/15 text-emerald-400",
  core: "bg-purple-500/15 text-purple-400",
};

export default async function ExercisesPage() {
  const exercises = await prisma.exercise.findMany({
    orderBy: [{ category: "asc" }, { nameFr: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Exercices"
        subtitle={`${exercises.length} exercices disponibles`}
      />
      <div className="px-4 pt-2 space-y-1">
        {exercises.map((ex) => (
          <Link key={ex.id} href={`/exercises/${ex.id}`}>
            <Card className="flex items-center gap-3 px-4 py-3 border-border/50 hover:bg-muted/30 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ex.nameFr}</p>
                <p className="text-xs text-muted-foreground capitalize">{ex.primaryMuscle.replace(/_/g, " ")}</p>
              </div>
              <Badge
                className={`text-[10px] px-2 py-0.5 rounded-full border-0 ${categoryColors[ex.category] ?? "bg-muted text-muted-foreground"}`}
              >
                {categoryLabels[ex.category] ?? ex.category}
              </Badge>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
