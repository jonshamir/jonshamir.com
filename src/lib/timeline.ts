import { saturate } from "./math";

export interface TimelinePhase {
  duration: number;
  overlap?: number; // seconds this phase starts before the previous one ends
  ease?: (x: number) => number;
}

export interface Timeline {
  total: number;
  at(t: number): number[]; // eased 0-1 progress per phase at time t
}

// Lays out phases sequentially; overlap pulls a phase's start earlier, clamped
// to its predecessor's duration so starts stay monotonic.
export function sequencePhases(phases: TimelinePhase[]): Timeline {
  const starts: number[] = [];
  let prevStart = 0;
  let prevDuration = 0;
  for (let i = 0; i < phases.length; i++) {
    const p = phases[i];
    const start =
      i === 0
        ? 0
        : prevStart + prevDuration - Math.min(p.overlap ?? 0, prevDuration);
    starts.push(start);
    prevStart = start;
    prevDuration = p.duration;
  }

  const total = phases.reduce(
    (end, p, i) => Math.max(end, starts[i] + p.duration),
    0
  );

  return {
    total,
    at: (t) =>
      phases.map((p, i) => {
        const x = saturate((t - starts[i]) / p.duration);
        return p.ease ? p.ease(x) : x;
      })
  };
}
