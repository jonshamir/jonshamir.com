import type { InferValues, Schema } from "../../../lib/tweakpane";

const num = (
  value: number,
  min: number,
  max: number,
  step: number,
  label: string
) => ({ value, min, max, step, label });

export const frondSchema = {
  division: num(1.6, 0, 4, 0.01, "Division"),
  stipe: num(0.3, 0, 1, 0.01, "Stipe"),
  width: num(0.008, 0.001, 0.03, 0.0005, "Rachis Width"),
  taper: num(0.35, 0, 1, 0.01, "Taper"),
  lean: num(-8, -60, 60, 0.5, "Lean"),
  curl: num(12, -180, 180, 1, "Curl"),
  droop: num(0, 0, 3, 0.01, "Droop"),
  wing: num(0, 0, 1, 0.01, "Wing"),
  apex: num(0.2, 0, 1, 0.01, "Apex"),
  asymmetry: num(0, -0.5, 0.5, 0.01, "Asymmetry"),
  jitter: num(0.1, 0, 1, 0.01, "Jitter"),
  seed: num(1, 0, 100, 1, "Seed")
} satisfies Schema;

type LevelDefaults = {
  count: number;
  spacing: number;
  length: number;
  tMax: number;
  base: number;
  baseExp: number;
  apexExp: number;
  angle: number;
  angleApex: number;
  alternate: number;
  stalk: number;
  width: number;
  curl: number;
  wing: number;
};

function levelSchema(d: LevelDefaults) {
  return {
    count: num(d.count, 1, 60, 0.01, "Count"),
    spacing: num(d.spacing, 0.4, 1.6, 0.01, "Spacing"),
    length: num(d.length, 0.02, 1, 0.005, "Length"),
    tMax: num(d.tMax, 0, 1, 0.01, "Widest At"),
    base: num(d.base, 0, 1, 0.01, "Base Size"),
    baseExp: num(d.baseExp, 0.2, 4, 0.01, "Base Curve"),
    apexExp: num(d.apexExp, 0.2, 6, 0.01, "Apex Curve"),
    angle: num(d.angle, 0, 120, 0.5, "Angle"),
    angleApex: num(d.angleApex, 0, 120, 0.5, "Apex Angle"),
    alternate: num(d.alternate, 0, 0.5, 0.01, "Alternate"),
    stalk: num(d.stalk, 0, 0.5, 0.01, "Stalk"),
    width: num(d.width, 0.002, 0.08, 0.001, "Midrib"),
    curl: num(d.curl, -120, 120, 1, "Curl"),
    wing: num(d.wing, 0, 1, 0.01, "Wing")
  } satisfies Schema;
}

const sides = (acroscopic: number, basiscopic: number) =>
  ({
    acroscopic: num(acroscopic, 0.3, 2, 0.01, "Acroscopic"),
    basiscopic: num(basiscopic, 0.3, 2, 0.01, "Basiscopic")
  }) satisfies Schema;

export const pinnaeSchema = levelSchema({
  count: 18,
  spacing: 0.85,
  length: 0.3,
  tMax: 0.3,
  base: 0.35,
  baseExp: 1.4,
  apexExp: 1.1,
  angle: 70,
  angleApex: 45,
  alternate: 0.2,
  stalk: 0.02,
  width: 0.02,
  curl: 10,
  wing: 0
});

export const pinnulesSchema = {
  ...levelSchema({
    count: 10,
    spacing: 0.95,
    length: 0.28,
    tMax: 0.15,
    base: 0.8,
    baseExp: 1,
    apexExp: 1.3,
    angle: 60,
    angleApex: 40,
    alternate: 0.15,
    stalk: 0,
    width: 0.03,
    curl: 8,
    wing: 0
  }),
  ...sides(1, 1)
} satisfies Schema;

export const segmentsSchema = {
  ...levelSchema({
    count: 6,
    spacing: 1,
    length: 0.35,
    tMax: 0.1,
    base: 0.8,
    baseExp: 1,
    apexExp: 1.2,
    angle: 55,
    angleApex: 35,
    alternate: 0,
    stalk: 0,
    width: 0.04,
    curl: 0,
    wing: 0
  }),
  ...sides(1, 1)
} satisfies Schema;

export const outlineSchema = {
  width: num(0.22, 0.02, 0.6, 0.005, "Width"),
  tMax: num(0.3, 0, 1, 0.01, "Widest At"),
  base: num(0.55, 0, 1, 0.01, "Base Size"),
  baseExp: num(1.6, 0.2, 4, 0.01, "Base Curve"),
  apexExp: num(1.4, 0.2, 6, 0.01, "Apex Curve"),
  margin: {
    value: "entire",
    options: ["entire", "crenate", "serrate"],
    label: "Margin"
  },
  teeth: num(8, 1, 40, 0.5, "Teeth"),
  toothDepth: num(0.25, 0, 1, 0.01, "Tooth Depth")
} satisfies Schema;

export const renderSchema = {
  color: { value: "#5f9a45", label: "Color" },
  softness: num(0.0015, 0, 0.012, 0.0001, "Softness"),
  resolution: num(1, 0.5, 2, 0.25, "Resolution")
} satisfies Schema;

export type FrondControls = InferValues<typeof frondSchema>;
export type LevelControls = InferValues<typeof pinnaeSchema> &
  Partial<InferValues<ReturnType<typeof sides>>>;
export type OutlineControls = InferValues<typeof outlineSchema>;
export type RenderControls = InferValues<typeof renderSchema>;
