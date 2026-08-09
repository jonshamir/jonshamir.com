import {
  easeInOutCubic,
  easeOutCubic,
  lerp,
  saturate
} from "../../../lib/math";
import { sequencePhases } from "../../../lib/timeline";
import {
  type InferValues,
  type Schema,
  schemaDefaults
} from "../../../lib/tweakpane";

// Single source of truth for the growth animation parameters: the tweakpane
// schema also defines GrowthParams and GROWTH_DEFAULTS.
export const growthSchema = {
  durLeaves: { value: 2.2, min: 0.2, max: 6, label: "Leaves Duration (s)" },
  durStalk: { value: 2.5, min: 0.2, max: 6, label: "Stalk Duration (s)" },
  durFlowers: { value: 1.2, min: 0.2, max: 6, label: "Flowers Duration (s)" },
  overlapStalk: { value: 10, min: 0, max: 10, label: "Stalk Overlap (s)" },
  overlapFlowers: { value: 1.1, min: 0, max: 2, label: "Flowers Overlap (s)" },
  startScale: { value: 0.25, min: 0.01, max: 1, label: "Start Scale" },
  matureAgeMult: {
    value: 120,
    min: 1,
    max: 500,
    step: 1,
    label: "Mature Age Mult"
  },
  flowerStagger: { value: 2, min: 0, max: 1, label: "Flower Stagger" }
} satisfies Schema;

export type GrowthParams = InferValues<typeof growthSchema>;

export const GROWTH_DEFAULTS: GrowthParams = schemaDefaults(growthSchema);

export interface GrowthValues {
  leaves: number; // eased maturity 0-1
  scale: number; // plant group scale
  stalk: number; // FlowerStem growingStage 0-1
  flowers: number; // flower open stage 0-1 (may overshoot slightly)
}

function growthTimeline(params: GrowthParams) {
  return sequencePhases([
    { duration: params.durLeaves, ease: easeOutCubic },
    {
      duration: params.durStalk,
      overlap: params.overlapStalk,
      ease: easeInOutCubic
    },
    {
      duration: params.durFlowers,
      overlap: params.overlapFlowers,
      ease: easeOutCubic
    }
  ]);
}

export function totalDuration(params: GrowthParams): number {
  return growthTimeline(params).total;
}

export function computeGrowthValues(
  progress: number,
  params: GrowthParams
): GrowthValues {
  const timeline = growthTimeline(params);
  const [leaves, stalk, flowers] = timeline.at(
    saturate(progress) * timeline.total
  );

  return {
    leaves,
    scale: lerp(params.startScale, 1, leaves),
    stalk,
    flowers
  };
}
