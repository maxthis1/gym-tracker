import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

const adapter =
  tursoUrl && !tursoUrl.startsWith("file:")
    ? new PrismaLibSql({ url: tursoUrl, authToken: tursoToken })
    : new PrismaLibSql({ url: `file:${path.join(process.cwd(), "dev.db")}` });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const exercises = [
  // ── PUSH ──────────────────────────────────────────────────────────────────
  { name: "Barbell Bench Press", nameFr: "Développé couché barre", category: "push", primaryMuscle: "chest", secondaryMuscles: ["triceps", "front_delt"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/barbell-bench-press/barbell-bench-press-illustration.jpg", tipsFr: "Garde les omoplates rétractées et une légère arche lombaire. Touche la poitrine basse et pousse vers le haut-arrière." },
  { name: "Incline Dumbbell Press", nameFr: "Développé incliné haltères", category: "push", primaryMuscle: "chest", secondaryMuscles: ["triceps", "front_delt"], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/incline-dumbbell-press/incline-dumbbell-press-illustration.jpg", tipsFr: "Inclinaison 30-45°. Amène les coudes à 75° du corps, pas à plat." },
  { name: "Dumbbell Bench Press", nameFr: "Développé couché haltères", category: "push", primaryMuscle: "chest", secondaryMuscles: ["triceps", "front_delt"], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/dumbbell-bench-press/dumbbell-bench-press-illustration.jpg", tipsFr: "Plus grand ROM qu'à la barre. Stabilisation accrue." },
  { name: "Cable Fly", nameFr: "Écarté poulie vis-à-vis", category: "push", primaryMuscle: "chest", secondaryMuscles: [], equipment: "cable", gifUrl: "https://static.strengthlevel.com/images/exercises/cable-fly/cable-fly-illustration.jpg", tipsFr: "Croise les mains en bas pour maximiser la contraction du grand pectoral." },
  { name: "Dumbbell Fly", nameFr: "Écarté haltères", category: "push", primaryMuscle: "chest", secondaryMuscles: [], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/dumbbell-fly/dumbbell-fly-illustration.jpg", tipsFr: "Légère flexion du coude tout au long du mouvement." },
  { name: "Overhead Press (Barbell)", nameFr: "Développé militaire barre", category: "push", primaryMuscle: "front_delt", secondaryMuscles: ["triceps", "lateral_delt"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/overhead-press/overhead-press-illustration.jpg", tipsFr: "Barre proche du visage à la montée. Gainage abdominal serré." },
  { name: "Overhead Press (Dumbbell)", nameFr: "Développé militaire haltères", category: "push", primaryMuscle: "front_delt", secondaryMuscles: ["triceps", "lateral_delt"], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/dumbbell-shoulder-press/dumbbell-shoulder-press-illustration.jpg", tipsFr: "Rotation neutre ou pronation en haut selon confort articulaire." },
  { name: "Lateral Raise", nameFr: "Élévations latérales", category: "push", primaryMuscle: "lateral_delt", secondaryMuscles: [], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/lateral-raise/lateral-raise-illustration.jpg", tipsFr: "Légère inclinaison vers l'avant, petit finger down, montée à 90° max." },
  { name: "Cable Lateral Raise", nameFr: "Élévations latérales poulie basse", category: "push", primaryMuscle: "lateral_delt", secondaryMuscles: [], equipment: "cable", gifUrl: "https://static.strengthlevel.com/images/exercises/cable-lateral-raise/cable-lateral-raise-illustration.jpg", tipsFr: "Tension constante contrairement aux haltères." },
  { name: "Tricep Pushdown (Rope)", nameFr: "Extension triceps poulie corde", category: "push", primaryMuscle: "triceps", secondaryMuscles: [], equipment: "cable", gifUrl: "https://static.strengthlevel.com/images/exercises/tricep-pushdown/tricep-pushdown-illustration.jpg", tipsFr: "Écarte la corde en bas pour maximiser la contraction. Coudes fixes." },
  { name: "Skull Crusher", nameFr: "Barre front / Skull crusher", category: "push", primaryMuscle: "triceps", secondaryMuscles: [], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/skull-crusher/skull-crusher-illustration.jpg", tipsFr: "Abaisse vers le front ou derrière la tête selon ton confort." },
  { name: "Tricep Dips", nameFr: "Dips triceps", category: "push", primaryMuscle: "triceps", secondaryMuscles: ["chest", "front_delt"], equipment: "bodyweight", gifUrl: "https://static.strengthlevel.com/images/exercises/tricep-dips/tricep-dips-illustration.jpg", tipsFr: "Corps vertical pour cibler les triceps, incliné pour la poitrine." },
  { name: "Overhead Tricep Extension", nameFr: "Extension triceps au-dessus de la tête", category: "push", primaryMuscle: "triceps", secondaryMuscles: [], equipment: "cable", gifUrl: "https://static.strengthlevel.com/images/exercises/overhead-cable-tricep-extension/overhead-cable-tricep-extension-illustration.jpg", tipsFr: "Long chef étiré en position haute — grand étirement myofascial." },
  { name: "Push Up", nameFr: "Pompes", category: "push", primaryMuscle: "chest", secondaryMuscles: ["triceps", "front_delt"], equipment: "bodyweight", gifUrl: "https://static.strengthlevel.com/images/exercises/push-up/push-up-illustration.jpg", tipsFr: "Corps rigide comme une planche. Descends la poitrine jusqu'au sol." },

  // ── PULL ──────────────────────────────────────────────────────────────────
  { name: "Deadlift", nameFr: "Soulevé de terre conventionnel", category: "pull", primaryMuscle: "back", secondaryMuscles: ["hamstrings", "glutes", "traps"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/deadlift/deadlift-illustration.jpg", tipsFr: "Barre contre les tibias, dos plat, hanches en bas, pousse le sol. Engage le grand dorsal en imaginant plier la barre." },
  { name: "Romanian Deadlift", nameFr: "Soulevé de terre roumain", category: "pull", primaryMuscle: "hamstrings", secondaryMuscles: ["glutes", "back"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/romanian-deadlift/romanian-deadlift-illustration.jpg", tipsFr: "Hanches reculent, dos plat, descend jusqu'à légère tension dans les ischios. Barre contre les jambes." },
  { name: "Yates Row", nameFr: "Rowing Yates (barre sous-prise)", category: "pull", primaryMuscle: "back", secondaryMuscles: ["biceps", "rear_delt"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/barbell-row/barbell-row-illustration.jpg", tipsFr: "45° de buste, prise supination. Tire vers le nombril, coudes proches du corps." },
  { name: "Barbell Row", nameFr: "Rowing barre pronation", category: "pull", primaryMuscle: "back", secondaryMuscles: ["biceps", "rear_delt"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/barbell-row/barbell-row-illustration.jpg", tipsFr: "Prise en pronation, tire vers le bas abdomen. Buste plus horizontal = plus de grand dorsal." },
  { name: "Pull Up", nameFr: "Traction prise large", category: "pull", primaryMuscle: "back", secondaryMuscles: ["biceps"], equipment: "bodyweight", gifUrl: "https://static.strengthlevel.com/images/exercises/pull-up/pull-up-illustration.jpg", tipsFr: "Déprime les omoplates avant de tirer. Tête au-dessus de la barre minimum." },
  { name: "Lat Pulldown (Wide Grip)", nameFr: "Tirage vertical poulie prise large", category: "pull", primaryMuscle: "back", secondaryMuscles: ["biceps"], equipment: "cable", gifUrl: "https://static.strengthlevel.com/images/exercises/lat-pulldown/lat-pulldown-illustration.jpg", tipsFr: "Pousse les coudes vers les hanches. Légère extension lombaire en bas." },
  { name: "Lat Pulldown (Neutral Grip)", nameFr: "Tirage vertical poulie prise neutre", category: "pull", primaryMuscle: "back", secondaryMuscles: ["biceps"], equipment: "cable", gifUrl: "https://static.strengthlevel.com/images/exercises/lat-pulldown/lat-pulldown-illustration.jpg", tipsFr: "Prise neutre = moins de stress pour les coudes. Engagement biceps accru." },
  { name: "Cable Row (Seated)", nameFr: "Tirage horizontal poulie basse", category: "pull", primaryMuscle: "back", secondaryMuscles: ["biceps", "rear_delt"], equipment: "cable", gifUrl: "https://static.strengthlevel.com/images/exercises/cable-row/cable-row-illustration.jpg", tipsFr: "Dos droit, tire vers le nombril, rétracte bien les omoplates en fin de mouvement." },
  { name: "Dumbbell Row", nameFr: "Rowing haltère unilatéral", category: "pull", primaryMuscle: "back", secondaryMuscles: ["biceps"], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/dumbbell-row/dumbbell-row-illustration.jpg", tipsFr: "Coude vers le plafond, rotation légère du torse pour plus d'amplitude." },
  { name: "Face Pull", nameFr: "Face pull", category: "pull", primaryMuscle: "rear_delt", secondaryMuscles: ["traps", "external_rotators"], equipment: "cable", gifUrl: "https://static.strengthlevel.com/images/exercises/face-pull/face-pull-illustration.jpg", tipsFr: "Tire vers le visage, coudes hauts, rotation externe en fin de mouvement. Santé de l'épaule." },
  { name: "Reverse Fly", nameFr: "Écarté poulie arrière / oiseau", category: "pull", primaryMuscle: "rear_delt", secondaryMuscles: ["traps"], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/reverse-fly/reverse-fly-illustration.jpg", tipsFr: "Penché à 45°, coudes légèrement fléchis, arc vers l'arrière." },
  { name: "Barbell Curl", nameFr: "Curl barre droite", category: "pull", primaryMuscle: "biceps", secondaryMuscles: [], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/barbell-curl/barbell-curl-illustration.jpg", tipsFr: "Coudes fixes contre le corps, supination complète en haut." },
  { name: "EZ Bar Curl", nameFr: "Curl barre EZ", category: "pull", primaryMuscle: "biceps", secondaryMuscles: [], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/ez-bar-curl/ez-bar-curl-illustration.jpg", tipsFr: "Moins de stress pour les poignets. Bonne option si la barre droite gêne." },
  { name: "Dumbbell Curl", nameFr: "Curl haltères alternés", category: "pull", primaryMuscle: "biceps", secondaryMuscles: [], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/dumbbell-curl/dumbbell-curl-illustration.jpg", tipsFr: "Supination à mi-montée. Un bras après l'autre ou simultané." },
  { name: "Incline Dumbbell Curl", nameFr: "Curl incliné haltères", category: "pull", primaryMuscle: "biceps", secondaryMuscles: [], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/incline-dumbbell-curl/incline-dumbbell-curl-illustration.jpg", tipsFr: "Banc à 45-60°. Long chef étiré = grande tension en bas. Excellent pour les pics de biceps." },
  { name: "Hammer Curl", nameFr: "Curl marteau", category: "pull", primaryMuscle: "biceps", secondaryMuscles: ["brachialis"], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/hammer-curl/hammer-curl-illustration.jpg", tipsFr: "Prise neutre. Cible le brachial antérieur et le brachioradial." },
  { name: "Cable Curl", nameFr: "Curl poulie basse", category: "pull", primaryMuscle: "biceps", secondaryMuscles: [], equipment: "cable", gifUrl: "https://static.strengthlevel.com/images/exercises/cable-curl/cable-curl-illustration.jpg", tipsFr: "Tension constante tout au long du mouvement contrairement aux haltères." },

  // ── LEGS ──────────────────────────────────────────────────────────────────
  { name: "Barbell Squat", nameFr: "Squat barre", category: "legs", primaryMuscle: "quads", secondaryMuscles: ["glutes", "hamstrings"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/barbell-squat/barbell-squat-illustration.jpg", tipsFr: "Pied à largeur d'épaules ou plus large. Descends jusqu'aux cuisses parallèles minimum. Genoux dans l'axe des pieds." },
  { name: "Leg Press", nameFr: "Presse inclinée", category: "legs", primaryMuscle: "quads", secondaryMuscles: ["glutes", "hamstrings"], equipment: "machine", gifUrl: "https://static.strengthlevel.com/images/exercises/leg-press/leg-press-illustration.jpg", tipsFr: "Pieds hauts = plus de fessiers/ischios. Pieds bas = plus de quadriceps. Ne verrouille pas les genoux." },
  { name: "Leg Extension", nameFr: "Leg extension", category: "legs", primaryMuscle: "quads", secondaryMuscles: [], equipment: "machine", gifUrl: "https://static.strengthlevel.com/images/exercises/leg-extension/leg-extension-illustration.jpg", tipsFr: "Contraction maximale en haut, descente contrôlée. Évite de soulever les fesses." },
  { name: "Lying Leg Curl", nameFr: "Leg curl allongé", category: "legs", primaryMuscle: "hamstrings", secondaryMuscles: [], equipment: "machine", gifUrl: "https://static.strengthlevel.com/images/exercises/lying-leg-curl/lying-leg-curl-illustration.jpg", tipsFr: "Hanche plaquée sur la machine, contraction complète. Descente lente de 3 secondes." },
  { name: "Seated Leg Curl", nameFr: "Leg curl assis", category: "legs", primaryMuscle: "hamstrings", secondaryMuscles: [], equipment: "machine", gifUrl: "https://static.strengthlevel.com/images/exercises/seated-leg-curl/seated-leg-curl-illustration.jpg", tipsFr: "Ischio étiré en position haute (hanche à 90°) = activation maximale." },
  { name: "Walking Lunges", nameFr: "Fentes marchées haltères", category: "legs", primaryMuscle: "quads", secondaryMuscles: ["glutes", "hamstrings"], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/walking-lunge/walking-lunge-illustration.jpg", tipsFr: "Grand pas, genou arrière proche du sol, torse droit. Alternatif = unilateral." },
  { name: "Bulgarian Split Squat", nameFr: "Squat bulgare haltères", category: "legs", primaryMuscle: "quads", secondaryMuscles: ["glutes"], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/bulgarian-split-squat/bulgarian-split-squat-illustration.jpg", tipsFr: "Pied arrière sur banc, descends jusqu'au sol. Torse légèrement incliné pour plus de fessiers." },
  { name: "Hip Thrust", nameFr: "Hip thrust", category: "legs", primaryMuscle: "glutes", secondaryMuscles: ["hamstrings"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/hip-thrust/hip-thrust-illustration.jpg", tipsFr: "Épaules sur le banc, barre sur les hanches. Extension complète, squeezer les fessiers en haut." },
  { name: "Glute Bridge", nameFr: "Pont fessier", category: "legs", primaryMuscle: "glutes", secondaryMuscles: ["hamstrings"], equipment: "bodyweight", gifUrl: "https://static.strengthlevel.com/images/exercises/glute-bridge/glute-bridge-illustration.jpg", tipsFr: "Version allégée du hip thrust, idéal pour l'activation ou l'échauffement." },
  { name: "Standing Calf Raise", nameFr: "Mollets debout", category: "legs", primaryMuscle: "calves", secondaryMuscles: [], equipment: "machine", gifUrl: "https://static.strengthlevel.com/images/exercises/standing-calf-raise/standing-calf-raise-illustration.jpg", tipsFr: "Descends complètement, monte sur la pointe. Pause d'1 sec en bas." },
  { name: "Seated Calf Raise", nameFr: "Mollets assis", category: "legs", primaryMuscle: "calves", secondaryMuscles: [], equipment: "machine", gifUrl: "https://static.strengthlevel.com/images/exercises/seated-calf-raise/seated-calf-raise-illustration.jpg", tipsFr: "Genou à 90° = soléaire ciblé davantage que le gastrocnémien." },
  { name: "Hack Squat", nameFr: "Hack squat machine", category: "legs", primaryMuscle: "quads", secondaryMuscles: ["glutes"], equipment: "machine", gifUrl: "https://static.strengthlevel.com/images/exercises/hack-squat/hack-squat-illustration.jpg", tipsFr: "Pieds bas sur la plateforme = plus de quadriceps. Descends profond." },
  { name: "Goblet Squat", nameFr: "Squat goblet haltère", category: "legs", primaryMuscle: "quads", secondaryMuscles: ["glutes"], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/goblet-squat/goblet-squat-illustration.jpg", tipsFr: "Haltère tenu contre la poitrine. Excellent pour apprendre la mécanique du squat." },
  { name: "Step Up", nameFr: "Step up avec haltères", category: "legs", primaryMuscle: "quads", secondaryMuscles: ["glutes"], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/step-up/step-up-illustration.jpg", tipsFr: "Monte et descends lentement. Contrôle la jambe libre." },

  // ── CORE ──────────────────────────────────────────────────────────────────
  { name: "Plank", nameFr: "Gainage planche", category: "core", primaryMuscle: "core", secondaryMuscles: [], equipment: "bodyweight", gifUrl: "https://static.strengthlevel.com/images/exercises/plank/plank-illustration.jpg", tipsFr: "Corps aligné de la tête aux talons. Contracte fessiers et abdos. Respire normalement." },
  { name: "Ab Wheel Rollout", nameFr: "Abdos roue", category: "core", primaryMuscle: "core", secondaryMuscles: [], equipment: "other", gifUrl: "https://static.strengthlevel.com/images/exercises/ab-wheel-rollout/ab-wheel-rollout-illustration.jpg", tipsFr: "Rentre le nombril, pousse les hanches vers le bas. Stop avant que le dos s'affaisse." },
  { name: "Hanging Leg Raise", nameFr: "Relevés de jambes barre fixe", category: "core", primaryMuscle: "core", secondaryMuscles: [], equipment: "bodyweight", gifUrl: "https://static.strengthlevel.com/images/exercises/hanging-leg-raise/hanging-leg-raise-illustration.jpg", tipsFr: "Évite l'élan. Contrôle la descente. Jambes droites pour les avancés." },
  { name: "Crunch", nameFr: "Crunch", category: "core", primaryMuscle: "core", secondaryMuscles: [], equipment: "bodyweight", gifUrl: "https://static.strengthlevel.com/images/exercises/crunch/crunch-illustration.jpg", tipsFr: "Ne tire pas sur la nuque. Flexion du rachis, pas juste relever la tête." },
  { name: "Russian Twist", nameFr: "Russian twist", category: "core", primaryMuscle: "core", secondaryMuscles: [], equipment: "bodyweight", gifUrl: "https://static.strengthlevel.com/images/exercises/russian-twist/russian-twist-illustration.jpg", tipsFr: "Pieds en l'air pour plus de difficulté. Rotation des épaules, pas juste les bras." },
  { name: "Cable Crunch", nameFr: "Crunch poulie haute", category: "core", primaryMuscle: "core", secondaryMuscles: [], equipment: "cable", gifUrl: "https://static.strengthlevel.com/images/exercises/cable-crunch/cable-crunch-illustration.jpg", tipsFr: "Tire avec les abdos, pas avec les bras. Flexion du rachis vers le bas." },
  { name: "Dead Bug", nameFr: "Dead bug", category: "core", primaryMuscle: "core", secondaryMuscles: [], equipment: "bodyweight", gifUrl: "https://static.strengthlevel.com/images/exercises/dead-bug/dead-bug-illustration.jpg", tipsFr: "Dos plat au sol. Extension bras/jambe opposés, expire en descendant." },

  // ── SUPPLÉMENTAIRES ───────────────────────────────────────────────────────
  { name: "Shrug (Barbell)", nameFr: "Haussements d'épaules barre", category: "pull", primaryMuscle: "traps", secondaryMuscles: [], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/barbell-shrug/barbell-shrug-illustration.jpg", tipsFr: "Monte les épaules vers les oreilles. Pas de rotation. Contraction 1 sec en haut." },
  { name: "Upright Row", nameFr: "Rowing vertical barre", category: "pull", primaryMuscle: "traps", secondaryMuscles: ["lateral_delt"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/upright-row/upright-row-illustration.jpg", tipsFr: "Prise large = moins de stress pour les épaules. Monte les coudes pas plus haut que les épaules." },
  { name: "Arnold Press", nameFr: "Arnold press", category: "push", primaryMuscle: "front_delt", secondaryMuscles: ["lateral_delt", "triceps"], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/arnold-press/arnold-press-illustration.jpg", tipsFr: "Rotation complète du poignet pendant le mouvement. Plus de deltoïde antérieur." },
  { name: "Front Raise", nameFr: "Élévation frontale", category: "push", primaryMuscle: "front_delt", secondaryMuscles: [], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/front-raise/front-raise-illustration.jpg", tipsFr: "Monte à hauteur des épaules max. Souvent pas nécessaire si presses lourdes." },
  { name: "Preacher Curl", nameFr: "Curl pupitre barre EZ", category: "pull", primaryMuscle: "biceps", secondaryMuscles: [], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/preacher-curl/preacher-curl-illustration.jpg", tipsFr: "Chef court des biceps bien ciblé. Extension complète en bas." },
  { name: "Concentration Curl", nameFr: "Curl concentration", category: "pull", primaryMuscle: "biceps", secondaryMuscles: [], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/concentration-curl/concentration-curl-illustration.jpg", tipsFr: "Coude contre la cuisse interne. Supination complète en haut." },
  { name: "Close Grip Bench Press", nameFr: "Développé couché prise serrée", category: "push", primaryMuscle: "triceps", secondaryMuscles: ["chest"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/close-grip-bench-press/close-grip-bench-press-illustration.jpg", tipsFr: "Prise légèrement plus étroite que les épaules. Coudes proches du corps." },
  { name: "Good Morning", nameFr: "Good morning", category: "legs", primaryMuscle: "hamstrings", secondaryMuscles: ["back", "glutes"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/good-morning/good-morning-illustration.jpg", tipsFr: "Charnière des hanches, dos neutre. Arrête si tu sens les lombaires plutôt que les ischios." },
  { name: "Sumo Deadlift", nameFr: "Soulevé de terre sumo", category: "pull", primaryMuscle: "back", secondaryMuscles: ["glutes", "hamstrings", "quads"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/sumo-deadlift/sumo-deadlift-illustration.jpg", tipsFr: "Pieds très écartés, orteils vers l'extérieur. Tire les genoux vers l'extérieur." },
  { name: "T-Bar Row", nameFr: "Rowing T-bar", category: "pull", primaryMuscle: "back", secondaryMuscles: ["biceps"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/t-bar-row/t-bar-row-illustration.jpg", tipsFr: "Tire vers le bas-abdomen. Excellent pour l'épaisseur du dos." },
  { name: "Chin Up", nameFr: "Traction prise supination", category: "pull", primaryMuscle: "back", secondaryMuscles: ["biceps"], equipment: "bodyweight", gifUrl: "https://static.strengthlevel.com/images/exercises/chin-up/chin-up-illustration.jpg", tipsFr: "Prise sous-prise = plus de biceps qu'une traction prise large." },
  { name: "Glute Kickback (Cable)", nameFr: "Kickback fessier poulie basse", category: "legs", primaryMuscle: "glutes", secondaryMuscles: [], equipment: "cable", gifUrl: "https://static.strengthlevel.com/images/exercises/cable-glute-kickback/cable-glute-kickback-illustration.jpg", tipsFr: "Extension complète de la hanche. Évite de compenser avec le bas du dos." },
  { name: "Nordic Curl", nameFr: "Nordic curl", category: "legs", primaryMuscle: "hamstrings", secondaryMuscles: [], equipment: "bodyweight", gifUrl: "https://static.strengthlevel.com/images/exercises/nordic-hamstring-curl/nordic-hamstring-curl-illustration.jpg", tipsFr: "Exercice exigeant pour les ischios. Descente contrôlée au max, push-up si nécessaire." },
  { name: "Box Jump", nameFr: "Saut sur boîte", category: "legs", primaryMuscle: "quads", secondaryMuscles: ["glutes", "calves"], equipment: "bodyweight", gifUrl: "https://static.strengthlevel.com/images/exercises/box-jump/box-jump-illustration.jpg", tipsFr: "Atterri avec les genoux fléchis. Redescend pas en sautant pour protéger les tendons." },
  { name: "Dumbbell Romanian Deadlift", nameFr: "Soulevé de terre roumain haltères", category: "legs", primaryMuscle: "hamstrings", secondaryMuscles: ["glutes"], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/romanian-deadlift/romanian-deadlift-illustration.jpg", tipsFr: "Plus de ROM qu'à la barre, descend plus bas. Idéal pour l'isolement des ischios." },
  { name: "Incline Bench Press (Barbell)", nameFr: "Développé incliné barre", category: "push", primaryMuscle: "chest", secondaryMuscles: ["triceps", "front_delt"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/incline-barbell-bench-press/incline-barbell-bench-press-illustration.jpg", tipsFr: "30-45°. Cible le faisceau claviculaire (haut poitrine). Barre descend vers la clavicule." },
  { name: "Decline Bench Press", nameFr: "Développé décliné barre", category: "push", primaryMuscle: "chest", secondaryMuscles: ["triceps"], equipment: "barbell", gifUrl: "https://static.strengthlevel.com/images/exercises/decline-bench-press/decline-bench-press-illustration.jpg", tipsFr: "Bas de la poitrine. Souvent moins utile — les dips peuvent le remplacer." },
  { name: "Seated Row (Machine)", nameFr: "Rowing prise neutre machine", category: "pull", primaryMuscle: "back", secondaryMuscles: ["biceps"], equipment: "machine", gifUrl: "https://static.strengthlevel.com/images/exercises/seated-row/seated-row-illustration.jpg", tipsFr: "Stabilité accrue vs poulie. Bonne option pour isoler le dos." },
  { name: "Chest Supported Row", nameFr: "Rowing poitrine soutenue", category: "pull", primaryMuscle: "back", secondaryMuscles: ["rear_delt", "biceps"], equipment: "dumbbell", gifUrl: "https://static.strengthlevel.com/images/exercises/chest-supported-row/chest-supported-row-illustration.jpg", tipsFr: "Aucune triche possible — le torse est plaqué. Parfait pour l'isolement." },
  { name: "Single Leg Press", nameFr: "Presse unilatérale", category: "legs", primaryMuscle: "quads", secondaryMuscles: ["glutes"], equipment: "machine", gifUrl: "https://static.strengthlevel.com/images/exercises/single-leg-press/single-leg-press-illustration.jpg", tipsFr: "Révèle les déséquilibres droite/gauche. Commence par la jambe la plus faible." },
];

async function main() {
  console.log("🌱 Starting seed...");

  // ── User ───────────────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { id: "default-user" },
    update: {},
    create: {
      id: "default-user",
      name: "Mathis",
      heightCm: 185,
      weightKg: 80,
      experienceLevel: "intermediate",
      goal: "hypertrophy",
    },
  });
  console.log(`✅ User created: ${user.name}`);

  // ── Exercises ──────────────────────────────────────────────────────────────
  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { id: `ex-${ex.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}` },
      update: { gifUrl: ex.gifUrl, tipsFr: ex.tipsFr },
      create: {
        id: `ex-${ex.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        name: ex.name,
        nameFr: ex.nameFr,
        category: ex.category,
        primaryMuscle: ex.primaryMuscle,
        secondaryMuscles: JSON.stringify(ex.secondaryMuscles ?? []),
        equipment: ex.equipment,
        gifUrl: ex.gifUrl ?? null,
        tipsFr: ex.tipsFr ?? "",
      },
    });
  }
  console.log(`✅ ${exercises.length} exercises seeded`);

  // ── Program ────────────────────────────────────────────────────────────────
  const program = await prisma.program.upsert({
    where: { id: "prog-upper-lower" },
    update: {},
    create: {
      id: "prog-upper-lower",
      userId: user.id,
      name: "Upper / Lower 4j — Prise de masse",
      description:
        "Programme 4 jours par semaine basé sur la double-progression et le RIR. Adapté à un niveau intermédiaire avec objectif hypertrophie.",
      isActive: true,
    },
  });
  console.log(`✅ Program created: ${program.name}`);

  // Helper to find exercise by French name
  const ex = (nameFr: string) => {
    const found = exercises.find((e) => e.nameFr === nameFr);
    if (!found) throw new Error(`Exercise not found: ${nameFr}`);
    return `ex-${found.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  };

  type TemplateExerciseInput = {
    exerciseId: string;
    orderIndex: number;
    targetSets: number;
    targetRepsMin: number;
    targetRepsMax: number;
    targetRir: number;
    restSeconds: number;
    notes?: string;
  };

  const templates: Array<{
    id: string;
    name: string;
    dayOfWeek: number;
    orderIndex: number;
    exercises: TemplateExerciseInput[];
  }> = [
    {
      id: "tpl-upper-a",
      name: "Upper A — Force",
      dayOfWeek: 0,
      orderIndex: 0,
      exercises: [
        { exerciseId: ex("Développé couché barre"), orderIndex: 0, targetSets: 4, targetRepsMin: 5, targetRepsMax: 7, targetRir: 2, restSeconds: 180 },
        { exerciseId: ex("Rowing Yates (barre sous-prise)"), orderIndex: 1, targetSets: 4, targetRepsMin: 6, targetRepsMax: 8, targetRir: 2, restSeconds: 180 },
        { exerciseId: ex("Développé militaire haltères"), orderIndex: 2, targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRir: 1, restSeconds: 120 },
        { exerciseId: ex("Tirage vertical poulie prise neutre"), orderIndex: 3, targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRir: 1, restSeconds: 120 },
        { exerciseId: ex("Curl barre EZ"), orderIndex: 4, targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRir: 1, restSeconds: 90 },
        { exerciseId: ex("Extension triceps poulie corde"), orderIndex: 5, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restSeconds: 90 },
      ],
    },
    {
      id: "tpl-lower-a",
      name: "Lower A — Quadriceps",
      dayOfWeek: 1,
      orderIndex: 1,
      exercises: [
        { exerciseId: ex("Squat barre"), orderIndex: 0, targetSets: 4, targetRepsMin: 5, targetRepsMax: 7, targetRir: 2, restSeconds: 180 },
        { exerciseId: ex("Presse inclinée"), orderIndex: 1, targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRir: 1, restSeconds: 120 },
        { exerciseId: ex("Fentes marchées haltères"), orderIndex: 2, targetSets: 3, targetRepsMin: 10, targetRepsMax: 10, targetRir: 1, restSeconds: 120, notes: "10 reps par jambe" },
        { exerciseId: ex("Leg extension"), orderIndex: 3, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRir: 1, restSeconds: 90 },
        { exerciseId: ex("Mollets debout"), orderIndex: 4, targetSets: 4, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restSeconds: 60 },
        { exerciseId: ex("Gainage planche"), orderIndex: 5, targetSets: 3, targetRepsMin: 45, targetRepsMax: 45, targetRir: 0, restSeconds: 60, notes: "45 secondes — durée en reps ici" },
      ],
    },
    {
      id: "tpl-upper-b",
      name: "Upper B — Hypertrophie",
      dayOfWeek: 3,
      orderIndex: 2,
      exercises: [
        { exerciseId: ex("Développé incliné haltères"), orderIndex: 0, targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, targetRir: 1, restSeconds: 120 },
        { exerciseId: ex("Tirage vertical poulie prise large"), orderIndex: 1, targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, targetRir: 1, restSeconds: 120 },
        { exerciseId: ex("Écarté poulie vis-à-vis"), orderIndex: 2, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRir: 1, restSeconds: 90 },
        { exerciseId: ex("Face pull"), orderIndex: 3, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRir: 1, restSeconds: 60 },
        { exerciseId: ex("Élévations latérales"), orderIndex: 4, targetSets: 4, targetRepsMin: 12, targetRepsMax: 15, targetRir: 1, restSeconds: 60 },
        { exerciseId: ex("Curl incliné haltères"), orderIndex: 5, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restSeconds: 90 },
        { exerciseId: ex("Dips triceps"), orderIndex: 6, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restSeconds: 90, notes: "Ou barre front si dips non dispo" },
      ],
    },
    {
      id: "tpl-lower-b",
      name: "Lower B — Postérieurs",
      dayOfWeek: 4,
      orderIndex: 3,
      exercises: [
        { exerciseId: ex("Soulevé de terre roumain"), orderIndex: 0, targetSets: 4, targetRepsMin: 6, targetRepsMax: 8, targetRir: 2, restSeconds: 180 },
        { exerciseId: ex("Hip thrust"), orderIndex: 1, targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRir: 1, restSeconds: 120 },
        { exerciseId: ex("Leg curl allongé"), orderIndex: 2, targetSets: 4, targetRepsMin: 10, targetRepsMax: 12, targetRir: 1, restSeconds: 90 },
        { exerciseId: ex("Squat bulgare haltères"), orderIndex: 3, targetSets: 3, targetRepsMin: 10, targetRepsMax: 10, targetRir: 1, restSeconds: 120, notes: "10 reps par jambe" },
        { exerciseId: ex("Mollets assis"), orderIndex: 4, targetSets: 4, targetRepsMin: 12, targetRepsMax: 15, targetRir: 1, restSeconds: 60 },
        { exerciseId: ex("Abdos roue"), orderIndex: 5, targetSets: 3, targetRepsMin: 8, targetRepsMax: 99, targetRir: 0, restSeconds: 60, notes: "AMRAP — va jusqu'à l'échec technique" },
      ],
    },
  ];

  for (const tpl of templates) {
    const template = await prisma.workoutTemplate.upsert({
      where: { id: tpl.id },
      update: {},
      create: {
        id: tpl.id,
        programId: program.id,
        name: tpl.name,
        dayOfWeek: tpl.dayOfWeek,
        orderIndex: tpl.orderIndex,
      },
    });

    for (const te of tpl.exercises) {
      await prisma.templateExercise.upsert({
        where: { id: `${tpl.id}-ex${te.orderIndex}` },
        update: {},
        create: {
          id: `${tpl.id}-ex${te.orderIndex}`,
          workoutTemplateId: template.id,
          exerciseId: te.exerciseId,
          orderIndex: te.orderIndex,
          targetSets: te.targetSets,
          targetRepsMin: te.targetRepsMin,
          targetRepsMax: te.targetRepsMax,
          targetRir: te.targetRir,
          restSeconds: te.restSeconds,
          notes: te.notes ?? "",
        },
      });
    }
    console.log(`✅ Template seeded: ${template.name}`);
  }

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
