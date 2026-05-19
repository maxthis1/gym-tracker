import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { estimate1RM } from "@/lib/fitness";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es un coach sportif expert en musculation naturelle. Tu travailles avec Mathis, un homme de 1m85, 80 kg, niveau intermédiaire, objectif prise de masse, programme Upper/Lower 4x/semaine.

Ton approche est basée sur la science (Jeff Nippard, Renaissance Periodization, Menno Henselmans) : double-progression, RIR, volume MEV/MAV/MRV par muscle, périodisation ondulatoire. Tu es bienveillant mais direct — pas de vague encouragement, des conseils concrets.

Tu réponds toujours en français. Tes réponses sont courtes et actionnables (3-5 phrases max sauf si on te demande une explication détaillée). Tu utilises les données d'entraînement de Mathis pour personnaliser tes réponses.

Si on te demande des suggestions de charge ou de programme, base-toi sur l'historique fourni dans le contexte.`;

async function buildContext(userId: string) {
  const [lastSessions, weekSets, prs] = await Promise.all([
    // Last 3 completed sessions
    prisma.workoutSession.findMany({
      where: { userId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 3,
      include: {
        template: true,
        sets: {
          where: { isWarmup: false },
          include: { exercise: { select: { nameFr: true } } },
          orderBy: { setNumber: "asc" },
        },
      },
    }),
    // This week's working sets
    prisma.exerciseSet.findMany({
      where: {
        session: {
          userId,
          completedAt: {
            not: null,
            gte: new Date(Date.now() - 7 * 86400000),
          },
        },
        isWarmup: false,
      },
      include: { exercise: { select: { nameFr: true, primaryMuscle: true } } },
    }),
    // Top PRs
    prisma.personalRecord.findMany({
      where: { userId },
      include: { exercise: { select: { nameFr: true } } },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ]);

  const sessionsSummary = lastSessions.map((s) => {
    const vol = s.sets.reduce((a, set) => a + set.weightKg * set.reps, 0);
    const setsSummary = s.sets
      .slice(0, 6)
      .map((set) => `  ${set.exercise.nameFr}: ${set.weightKg}kg×${set.reps} RIR${set.rir ?? "?"}`)
      .join("\n");
    return `[${s.template?.name ?? "Séance"} — ${s.completedAt?.toLocaleDateString("fr-FR") ?? "?"}] Volume: ${Math.round(vol / 1000 * 10) / 10}T\n${setsSummary}`;
  });

  const weekVolume = weekSets.reduce((acc, s) => {
    const m = s.exercise.primaryMuscle;
    acc[m] = (acc[m] ?? 0) + s.weightKg * s.reps;
    return acc;
  }, {} as Record<string, number>);

  const prsSummary = prs.map((r) => `${r.exercise.nameFr}: ${Math.round(r.value)} kg (${r.recordType})`).join(", ");

  return `
CONTEXTE ENTRAÎNEMENT DE MATHIS:
Date actuelle: ${new Date().toLocaleDateString("fr-FR")}

DERNIÈRES SÉANCES:
${sessionsSummary.length ? sessionsSummary.join("\n\n") : "Aucune séance récente"}

VOLUME CETTE SEMAINE (par muscle):
${Object.entries(weekVolume).map(([m, v]) => `${m}: ${Math.round(v / 100) / 10}T`).join(", ") || "Aucun set cette semaine"}

RECORDS PERSONNELS:
${prsSummary || "Aucun PR enregistré"}
`.trim();
}

export async function POST(req: NextRequest) {
  const { messages, userId = "default-user" } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY non configurée dans .env" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Build dynamic context
  const context = await buildContext(userId);

  // Persist user message
  const lastUserMsg = messages[messages.length - 1];
  if (lastUserMsg?.role === "user") {
    await prisma.coachMessage.create({
      data: { userId, role: "user", content: lastUserMsg.content, context },
    });
  }

  // Stream response
  const stream = await client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: `${SYSTEM_PROMPT}\n\n${context}`,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  });

  // Collect full response for DB persistence
  let fullText = "";

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          const text = chunk.delta.text;
          fullText += text;
          controller.enqueue(encoder.encode(text));
        }
      }
      // Persist assistant reply
      if (fullText) {
        await prisma.coachMessage.create({
          data: { userId, role: "assistant", content: fullText, context: "{}" },
        }).catch(() => {});
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
