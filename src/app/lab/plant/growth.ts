import {
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  lerp,
  saturate
} from "./utils";

export interface GrowthParams {
  durLeaves: number;
  durStalk: number;
  durFlowers: number;
  overlapStalk: number;
  overlapFlowers: number;
  startScale: number;
  matureAgeMult: number;
  flowerStagger: number;
}

export const GROWTH_DEFAULTS: GrowthParams = {
  durLeaves: 2.2,
  durStalk: 2.5,
  durFlowers: 1.2,
  overlapStalk: 10,
  overlapFlowers: 0.8,
  startScale: 0.25,
  matureAgeMult: 120,
  flowerStagger: 2
};

export interface GrowthValues {
  leaves: number; // eased maturity 0-1
  scale: number; // plant group scale
  stalk: number; // FlowerStem growingStage 0-1
  flowers: number; // flower open stage 0-1 (may overshoot slightly)
}

interface PhaseWindows {
  leavesStart: number;
  stalkStart: number;
  flowersStart: number;
}

function phaseWindows(params: GrowthParams): PhaseWindows {
  const stalkStart =
    params.durLeaves - Math.min(params.overlapStalk, params.durLeaves);
  const flowersStart =
    stalkStart +
    params.durStalk -
    Math.min(params.overlapFlowers, params.durStalk);
  return { leavesStart: 0, stalkStart, flowersStart };
}

export function totalDuration(params: GrowthParams): number {
  const { flowersStart } = phaseWindows(params);
  return flowersStart + params.durFlowers;
}

function phase(t: number, start: number, duration: number): number {
  return saturate((t - start) / duration);
}

export function computeGrowthValues(
  progress: number,
  params: GrowthParams
): GrowthValues {
  const t = saturate(progress) * totalDuration(params);
  const windows = phaseWindows(params);

  const leaves = easeOutCubic(phase(t, windows.leavesStart, params.durLeaves));
  const stalk = easeInOutCubic(phase(t, windows.stalkStart, params.durStalk));
  const flowers = easeOutBack(
    phase(t, windows.flowersStart, params.durFlowers)
  );

  return {
    leaves,
    scale: lerp(params.startScale, 1, leaves),
    stalk,
    flowers
  };
}
