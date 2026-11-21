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

// Matches the slider steps in fruitControls, which Tweakpane snaps to anyway.
const round = (value: number) => Number(value.toFixed(3));

// Version 1: the bulge/flare/tension sliders placed the same three anchors
// directly, so this conversion is exact up to slider precision.
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

  return {
    height,
    radius,
    baseY: 0,
    baseHandle: round(baseFlare),
    baseAngle: 0,
    midX: 1,
    midY: round(bulge),
    midAngle: 90,
    midIn: round(bottomTension * bulge),
    midOut: round(topTension * (1 - bulge)),
    tipY: 1,
    tipHandle: round(tipFlare),
    tipAngle: 180
  };
}

const KEPT_KEYS = [
  "height",
  "radius",
  "baseY",
  "baseHandle",
  "baseAngle",
  "midX",
  "midY",
  "midAngle",
  "midIn",
  "midOut",
  "tipY",
  "tipHandle",
  "tipAngle"
];

// Version 2 had shoulder anchors between the poles and the middle. Those came
// from halving each segment, which halves the handles beside the kept anchors,
// so doubling them back reverses it; shoulders that were moved by hand can
// only be approximated.
export function migrateFiveAnchorShape(
  shape: Record<string, unknown>
): Record<string, unknown> {
  const kept = Object.fromEntries(
    KEPT_KEYS.filter((key) => typeof shape[key] === "number").map((key) => [
      key,
      shape[key]
    ])
  );
  const double = (key: string) =>
    typeof kept[key] === "number" ? { [key]: kept[key] * 2 } : {};

  return {
    baseAngle: 0,
    tipAngle: 180,
    ...kept,
    ...double("baseHandle"),
    ...double("midIn"),
    ...double("midOut"),
    ...double("tipHandle")
  };
}
