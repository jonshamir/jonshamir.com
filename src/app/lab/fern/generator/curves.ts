import { clamp } from "../../../../lib/math";

export type Envelope = {
  tMax: number;
  base: number;
  baseExp: number;
  apexExp: number;
};

// Peak 1 at tMax. Rises from `base` at t = 0 and falls to 0 at t = 1.
export function envelope(t: number, e: Envelope): number {
  const x = clamp(t, 0, 1);
  if (x < e.tMax) {
    const u = 1 - x / e.tMax;
    return e.base + (1 - e.base) * (1 - Math.pow(u, e.baseExp));
  }
  const span = 1 - e.tMax;
  if (span <= 0) return 1;
  return 1 - Math.pow((x - e.tMax) / span, e.apexExp);
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
