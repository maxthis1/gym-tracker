import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { templateId } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("Coach IA non disponible (clé API manquante).", {
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Fetch context: template + last 2 sessions of same template + last 3 sessions global
  const [template, lastSameTemplate, recentSessions] = await Promise.all([
    prisma.workoutTemplate.findUnique({
      where: { id: templateId },
      include: {
        exercises: {
          orderBy: { orderIndex: "asc" },
          include: { exercise: { select: { nameFr: true, primaryMuscle: true } } },
        },
      },
    }),
    prisma.workoutSession.findMany({
      where: { workoutTemplateId: templateId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 2,
      include: {
        sets: {
          where: { isWarmup: false },
          include: { exercise: { select: { nameFr: true } } },
          orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
        },
      },
    }),
    prisma.workoutSession.findMany({
      where: { userId: "default-user", completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 3,
      select: { completedAt: true, energyLevel: true, sleepHours: true },
    }),
  ]);

  if (!template) {
    return new Response("Prêt pour la séance. Bonne session !", {
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Build summary of last same-template session
  const lastSession = lastSameTemplate[0];
  const lastSetsSummary = lastSession
    ? lastSession.sets
        .slice(0, 6)
        .map((s) => `${s.exercise.nameFr}: ${s.weightKg}kg×${s.reps}`)
        .join(", ")
    : "Première fois sur ce template";

  const exerciseList = template.exercises
    .map((te) => `${te.exercise.nameFr} ${te.targetSets}×${te.targetRepsMin}-${te.targetRepsMax} RIR${te.targetRir}`)
    .join(", ");

  const avgSleep = recentSessions.filter((s) => s.sleepHours).reduce((a, s) => a + (s.sleepHours ?? 0), 0) /
    (recentSessions.filter((s) => s.sleepHours).length || 1);

  const prompt = `Tu es le coach de Mathis. Il va commencer "${template.name}" maintenant.

Programme du jour: ${exerciseList}

Dernière séance identique (${lastSession?.completedAt?.toLocaleDateString("fr-FR") ?? "jamais fait"}): ${lastSetsSummary}

Sommeil récent moyen: ${avgSleep > 0 ? avgSleep.toFixed(1) + "h" : "non renseigné"}

Génère UN briefing motivant et concret de 2-3 phrases max. Cite des chiffres précis de l'historique. Donne un objectif pour la séance d'aujourd'hui.`;

  const stream = await client.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 200,
    system: "Tu es un coach muscu expert. Réponds toujours en français. Sois direct, précis, motivant. 2-3 phrases max.",
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
