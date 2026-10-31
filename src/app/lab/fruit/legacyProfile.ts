import type { FruitProfileParams } from "./fruitProfile";

export type LegacyProfileParams = {
  height: number;
  radius: number;
  bulge: number;
  baseFlare: number;
  bottomTension: number;
  topTension: number;
  tipFlare: number;
};

export const LEGACY_DEFAULTS: LegacyProfileParams = {
  height: 2,
  radius: 1,
  bulge: 0.42,
  baseFlare: 0.75,
  bottomTension: 0.55,
  topTension: 0.6,
  tipFlare: 0.8
};

type Point = [number, number];

const mid = (a: Point, b: Point): Point => [
  (a[0] + b[0]) / 2,
  (a[1] + b[1]) / 2
];
const distance = (a: Point, b: Point) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const angleOf = (from: Point, to: Point) =>
  (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;

// De Casteljau at t = 0.5: the split point plus the handles either side of it.
function split(p0: Point, p1: Point, p2: Point, p3: Point) {
  const a = mid(p0, p1);
  const b = mid(p1, p2);
  const c = mid(p2, p3);
  const d = mid(a, b);
  const e = mid(b, c);
  return { a, c, d, e, m: mid(d, e) };
}

// Matches the slider steps in fruitControls, which Tweakpane snaps to anyway.
const round = (value: number) => Number(value.toFixed(3));
const roundAngle = (value: number) => Number(value.toFixed(1));

// The old two-cubic profile, halved into four at t = 0.5, is exactly the
// five-anchor one; only the rounding to slider precision loses anything.
export function migrateLegacyShape(
  old: Partial<LegacyProfileParams>
): FruitProfileParams {
  const {
    height,
    radius,
    bulge,
    baseFlare,
    bottomTension,
    topTension,
    tipFlare
  } = { ...LEGACY_DEFAULTS, ...old };

  const lower = split(
    [0, 0],
    [baseFlare, 0],
    [1, bulge * (1 - bottomTension)],
    [1, bulge]
  );
  const upper = split(
    [1, bulge],
    [1, bulge + topTension * (1 - bulge)],
    [tipFlare, 1],
    [0, 1]
  );

  return {
    height,
    radius,
    baseY: 0,
    baseHandle: round(lower.a[0]),
    lowerX: round(lower.m[0]),
    lowerY: round(lower.m[1]),
    lowerAngle: roundAngle(angleOf(lower.d, lower.e)),
    lowerIn: round(distance(lower.d, lower.m)),
    lowerOut: round(distance(lower.m, lower.e)),
    midX: 1,
    midY: round(bulge),
    midAngle: 90,
    midIn: round(distance(lower.c, [1, bulge])),
    midOut: round(distance([1, bulge], upper.a)),
    upperX: round(upper.m[0]),
    upperY: round(upper.m[1]),
    upperAngle: roundAngle(angleOf(upper.d, upper.e)),
    upperIn: round(distance(upper.d, upper.m)),
    upperOut: round(distance(upper.m, upper.e)),
    tipY: 1,
    tipHandle: round(upper.c[0])
  };
}
