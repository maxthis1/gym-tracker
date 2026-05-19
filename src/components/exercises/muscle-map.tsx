"use client";

import { cn } from "@/lib/utils";

interface MuscleMapProps {
  primaryMuscle: string;
  secondaryMuscles: string[];
  className?: string;
}

/* ── Muscle group → SVG path IDs ─────────────────────────────────── */
const FRONT_MAP: Record<string, string[]> = {
  chest:        ["f-pec-l",    "f-pec-r"],
  front_delt:   ["f-fdelt-l",  "f-fdelt-r"],
  lateral_delt: ["f-ldelt-l",  "f-ldelt-r"],
  traps:        ["f-trap-l",   "f-trap-r"],
  biceps:       ["f-bicep-l",  "f-bicep-r"],
  triceps:      ["f-tri-l",    "f-tri-r"],
  core:         ["f-abs"],
  quads:        ["f-quad-l",   "f-quad-r"],
  calves:       ["f-calf-l",   "f-calf-r"],
};

const BACK_MAP: Record<string, string[]> = {
  back:         ["b-lat-l",    "b-lat-r"],
  traps:        ["b-trap-l",   "b-trap-r"],
  rear_delt:    ["b-rdelt-l",  "b-rdelt-r"],
  triceps:      ["b-tri-l",    "b-tri-r"],
  glutes:       ["b-glute-l",  "b-glute-r"],
  hamstrings:   ["b-ham-l",    "b-ham-r"],
  calves:       ["b-calf-l",   "b-calf-r"],
};

/* ── Path data (viewBox 0 0 80 200) ──────────────────────────────── */
const PATHS: Record<string, string> = {
  /* FRONT */
  "f-trap-l":   "M36,26 C30,28 21,32 16,41 C14,45 17,48 21,46 C26,43 34,32 38,27 Z",
  "f-trap-r":   "M44,26 C50,28 59,32 64,41 C66,45 63,48 59,46 C54,43 46,32 42,27 Z",
  "f-fdelt-l":  "M13,42 C8,43 5,49 7,55 C9,61 15,62 19,58 C21,54 19,47 15,42 Z",
  "f-fdelt-r":  "M67,42 C72,43 75,49 73,55 C71,61 65,62 61,58 C59,54 61,47 65,42 Z",
  "f-ldelt-l":  "M7,51 C3,49 1,55 3,60 C5,64 10,63 12,59 C12,55 9,50 7,51 Z",
  "f-ldelt-r":  "M73,51 C77,49 79,55 77,60 C75,64 70,63 68,59 C68,55 71,50 73,51 Z",
  "f-pec-l":    "M20,40 C22,35 34,35 36,43 C38,50 35,58 29,60 C22,60 17,55 18,47 Z",
  "f-pec-r":    "M60,40 C58,35 46,35 44,43 C42,50 45,58 51,60 C58,60 63,55 62,47 Z",
  "f-bicep-l":  "M9,59 C6,63 6,76 9,80 C12,82 17,80 17,73 C17,65 14,59 11,59 Z",
  "f-bicep-r":  "M71,59 C74,63 74,76 71,80 C68,82 63,80 63,73 C63,65 66,59 69,59 Z",
  "f-tri-l":    "M6,58 C3,62 3,74 6,78 L9,77 L8,58 Z",
  "f-tri-r":    "M74,58 C77,62 77,74 74,78 L71,77 L72,58 Z",
  "f-abs":      "M31,60 C33,57 47,57 49,60 L49,92 C47,95 33,95 31,92 Z",
  "f-quad-l":   "M22,94 C17,98 16,124 20,136 C24,140 33,138 34,130 C36,118 34,97 28,94 Z",
  "f-quad-r":   "M58,94 C63,98 64,124 60,136 C56,140 47,138 46,130 C44,118 46,97 52,94 Z",
  "f-calf-l":   "M20,140 C15,144 15,164 19,170 C23,174 30,172 30,162 C30,152 26,142 22,140 Z",
  "f-calf-r":   "M60,140 C65,144 65,164 61,170 C57,174 50,172 50,162 C50,152 54,142 58,140 Z",

  /* BACK */
  "b-trap-l":   "M36,26 C29,28 19,33 14,43 C12,49 16,54 21,51 C27,48 35,37 39,27 Z",
  "b-trap-r":   "M44,26 C51,28 61,33 66,43 C68,49 64,54 59,51 C53,48 45,37 41,27 Z",
  "b-rdelt-l":  "M12,47 C7,48 4,54 6,60 C9,65 15,65 18,60 C19,55 17,48 13,47 Z",
  "b-rdelt-r":  "M68,47 C73,48 76,54 74,60 C71,65 65,65 62,60 C61,55 63,48 67,47 Z",
  "b-lat-l":    "M17,52 C12,57 10,78 15,89 C19,94 31,92 34,81 C37,70 33,55 23,52 Z",
  "b-lat-r":    "M63,52 C68,57 70,78 65,89 C61,94 49,92 46,81 C43,70 47,55 57,52 Z",
  "b-tri-l":    "M7,54 C4,58 4,74 7,80 C10,84 16,82 16,72 C16,62 12,54 9,54 Z",
  "b-tri-r":    "M73,54 C76,58 76,74 73,80 C70,84 64,82 64,72 C64,62 68,54 71,54 Z",
  "b-glute-l":  "M21,94 C16,98 15,116 21,122 C27,126 38,122 40,111 C40,101 32,94 25,94 Z",
  "b-glute-r":  "M59,94 C64,98 65,116 59,122 C53,126 42,122 40,111 C40,101 48,94 55,94 Z",
  "b-ham-l":    "M20,124 C16,128 15,152 20,160 C24,164 33,162 35,151 C37,139 34,126 26,124 Z",
  "b-ham-r":    "M60,124 C64,128 65,152 60,160 C56,164 47,162 45,151 C43,139 46,126 54,124 Z",
  "b-calf-l":   "M20,164 C16,168 16,184 20,190 C24,194 30,192 30,182 C30,172 26,165 22,164 Z",
  "b-calf-r":   "M60,164 C64,168 64,184 60,190 C56,194 50,192 50,182 C50,172 54,165 58,164 Z",
};

/* ── Silhouette (body shape) ─────────────────────────────────────── */
function BodySilhouette({ back = false }: { back?: boolean }) {
  return (
    <g opacity={0.12} fill="currentColor">
      {/* Head */}
      <circle cx="40" cy="15" r="11" />
      {/* Neck */}
      <rect x="35" y="24" width="10" height="9" rx="2" />
      {/* Torso */}
      <path d="M24,32 C18,32 13,36 13,43 L13,92 C13,95 16,96 20,96 L60,96 C64,96 67,95 67,92 L67,43 C67,36 62,32 56,32 Z" />
      {/* Left upper arm */}
      <path d="M13,44 C9,44 4,48 5,56 L5,78 C6,82 10,83 13,81 L13,60" />
      {/* Right upper arm */}
      <path d="M67,44 C71,44 76,48 75,56 L75,78 C74,82 70,83 67,81 L67,60" />
      {/* Left forearm */}
      <path d="M5,78 C3,82 4,96 8,98 C11,99 15,97 15,89 L13,80" />
      {/* Right forearm */}
      <path d="M75,78 C77,82 76,96 72,98 C69,99 65,97 65,89 L67,80" />
      {/* Left thigh */}
      <path d="M20,95 L20,143 C20,147 23,149 27,149 C31,149 34,147 34,143 L34,95" />
      {/* Right thigh */}
      <path d="M46,95 L46,143 C46,147 49,149 53,149 C57,149 60,147 60,143 L60,95" />
      {/* Left shin */}
      <path d="M20,143 L20,170 C20,174 23,176 27,176 C31,176 34,174 34,170 L34,143" />
      {/* Right shin */}
      <path d="M46,143 L46,170 C46,174 49,176 53,176 C57,176 60,174 60,170 L60,143" />
      {/* Feet */}
      {!back ? (
        <>
          <ellipse cx="26" cy="172" rx="8" ry="4" />
          <ellipse cx="54" cy="172" rx="8" ry="4" />
        </>
      ) : (
        <>
          <ellipse cx="26" cy="172" rx="8" ry="4" />
          <ellipse cx="54" cy="172" rx="8" ry="4" />
        </>
      )}
    </g>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export function MuscleMap({ primaryMuscle, secondaryMuscles, className }: MuscleMapProps) {
  const primaryIds = new Set([
    ...(FRONT_MAP[primaryMuscle] ?? []),
    ...(BACK_MAP[primaryMuscle] ?? []),
  ]);
  const secondaryIds = new Set(
    secondaryMuscles.flatMap((m) => [...(FRONT_MAP[m] ?? []), ...(BACK_MAP[m] ?? [])])
  );

  const getColor = (id: string): string => {
    if (primaryIds.has(id)) return "hsl(4 90% 58%)";      // red
    if (secondaryIds.has(id)) return "hsl(25 95% 60%)";   // orange
    return "transparent";
  };

  const renderMuscles = (ids: string[]) =>
    ids.map((id) => {
      const d = PATHS[id];
      if (!d) return null;
      const fill = getColor(id);
      const active = fill !== "transparent";
      return (
        <path
          key={id}
          d={d}
          fill={fill}
          opacity={active ? 0.9 : 0}
          style={{ filter: active ? "drop-shadow(0 0 3px rgba(220,38,38,0.5))" : undefined }}
        />
      );
    });

  const frontIds = Object.values(FRONT_MAP).flat();
  const backIds  = Object.values(BACK_MAP).flat();

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      {/* Front view */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Face</span>
        <svg viewBox="0 0 80 180" width="90" height="180" className="text-foreground">
          <BodySilhouette />
          {renderMuscles(frontIds)}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: "hsl(4 90% 58%)" }} />
          <span className="text-foreground/80 capitalize">
            {primaryMuscle.replace(/_/g, " ")}
          </span>
        </div>
        {secondaryMuscles.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: "hsl(25 95% 60%)" }} />
            <span className="text-muted-foreground">
              {secondaryMuscles.slice(0, 2).map((m) => m.replace(/_/g, " ")).join(", ")}
              {secondaryMuscles.length > 2 && ` +${secondaryMuscles.length - 2}`}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="w-3 h-3 rounded-full shrink-0 bg-muted" />
          <span className="text-muted-foreground/60">Inactif</span>
        </div>
      </div>

      {/* Back view */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Dos</span>
        <svg viewBox="0 0 80 180" width="90" height="180" className="text-foreground">
          <BodySilhouette back />
          {renderMuscles(backIds)}
        </svg>
      </div>
    </div>
  );
}
