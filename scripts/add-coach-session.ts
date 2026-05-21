/**
 * Adds:
 *  - 2 new exercises (Smith Machine bench, Pec Deck)
 *  - Template "Coach — Pecto & Triceps" to existing program
 * Run: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/add-coach-session.ts
 */
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient({ url, authToken });

async function run() {
  // ── 1. New exercises ────────────────────────────────────────────────────────
  const newExercises = [
    {
      id: "ex-smith-machine-bench",
      name: "Smith Machine Bench Press",
      nameFr: "Développé couché Smith Machine",
      category: "strength",
      primaryMuscle: "chest",
      secondaryMuscles: JSON.stringify(["triceps", "front_delt"]),
      equipment: "smith_machine",
      instructions: "Allonge-toi sur le banc sous la barre Smith. Descends la barre jusqu'à la poitrine, remonte en contrôlant.",
      tipsFr: "Garde les omoplates rétractées. Série tempo : 4 secondes descente.",
    },
    {
      id: "ex-pec-deck",
      name: "Pec Deck / Butterfly Machine",
      nameFr: "Pec Deck — Machine pectoraux",
      category: "strength",
      primaryMuscle: "chest",
      secondaryMuscles: JSON.stringify(["front_delt"]),
      equipment: "machine",
      instructions: "Assis sur la machine, coudes à 90°. Joins les bras devant toi en contractant les pectoraux. Reviens lentement.",
      tipsFr: "Pense à serrer les pecs en position fermée. Ne laisse pas les coudes remonter.",
    },
  ];

  for (const ex of newExercises) {
    try {
      await client.execute({
        sql: `INSERT INTO "Exercise" (id, name, nameFr, category, primaryMuscle, secondaryMuscles, equipment, instructions, tipsFr, isCustom, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
        args: [ex.id, ex.name, ex.nameFr, ex.category, ex.primaryMuscle, ex.secondaryMuscles, ex.equipment, ex.instructions, ex.tipsFr],
      });
      console.log(`✅ Exercise added: ${ex.nameFr}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("UNIQUE") || msg.includes("already exists")) {
        console.log(`⚠  Already exists: ${ex.nameFr}`);
      } else throw e;
    }
  }

  // ── 2. Get existing program id ───────────────────────────────────────────────
  const prog = await client.execute(`SELECT id FROM "Program" LIMIT 1`);
  const programId = prog.rows[0]?.id as string;
  if (!programId) throw new Error("No program found");

  // ── 3. New template ──────────────────────────────────────────────────────────
  const templateId = "tpl-coach-pecto";
  try {
    await client.execute({
      sql: `INSERT INTO "WorkoutTemplate" (id, programId, name, dayOfWeek, orderIndex)
            VALUES (?, ?, ?, NULL, 10)`,
      args: [templateId, programId, "Coach — Pecto & Triceps"],
    });
    console.log(`✅ Template added: Coach — Pecto & Triceps`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("UNIQUE") || msg.includes("already exists")) {
      console.log(`⚠  Template already exists — updating exercises`);
      // Clean existing template exercises before re-inserting
      await client.execute({
        sql: `DELETE FROM "TemplateExercise" WHERE workoutTemplateId = ?`,
        args: [templateId],
      });
    } else throw e;
  }

  // ── 4. Template exercises (from the coach photo) ─────────────────────────────
  const templateExercises = [
    {
      exerciseId: "ex-smith-machine-bench",
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 10,
      targetRir: 2,
      restSeconds: 120,
      notes: "Objectif 20 kg/côté. Faire 1 série tempo 15 reps avant.",
      orderIndex: 0,
    },
    {
      exerciseId: "ex-pec-deck",
      targetSets: 3,
      targetRepsMin: 10,
      targetRepsMax: 12,
      targetRir: 2,
      restSeconds: 90,
      notes: "25–30 kg",
      orderIndex: 1,
    },
    {
      exerciseId: "ex-cable-fly",
      targetSets: 3,
      targetRepsMin: 12,
      targetRepsMax: 15,
      targetRir: 2,
      restSeconds: 60,
      notes: "5 kg par côté",
      orderIndex: 2,
    },
    {
      exerciseId: "ex-skull-crusher",
      targetSets: 3,
      targetRepsMin: 12,
      targetRepsMax: 15,
      targetRir: 2,
      restSeconds: 90,
      notes: "17,5 kg",
      orderIndex: 3,
    },
    {
      exerciseId: "ex-overhead-tricep-extension",
      targetSets: 3,
      targetRepsMin: 12,
      targetRepsMax: 12,
      targetRir: 2,
      restSeconds: 60,
      notes: "5 kg",
      orderIndex: 4,
    },
  ];

  for (const te of templateExercises) {
    const teId = `te-coach-pecto-${te.orderIndex}`;
    await client.execute({
      sql: `INSERT INTO "TemplateExercise" (id, workoutTemplateId, exerciseId, orderIndex, targetSets, targetRepsMin, targetRepsMax, targetRir, restSeconds, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [teId, templateId, te.exerciseId, te.orderIndex, te.targetSets, te.targetRepsMin, te.targetRepsMax, te.targetRir, te.restSeconds, te.notes],
    });
    console.log(`  ✅ Exercise ${te.orderIndex + 1}: ${te.exerciseId}`);
  }

  console.log("\n🎉 Done! Template 'Coach — Pecto & Triceps' is ready.");
  client.close();
}

run().catch(console.error);
