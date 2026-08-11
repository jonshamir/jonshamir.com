import { type Schema } from "../../../lib/tweakpane";
import { PLANT_BG } from "./plantBg";

const GOLDEN_ANGLE = 2.39996;

export const environmentSchema = {
  bgColor: { value: PLANT_BG, label: "Background", alpha: true },
  groundColor: { value: "#7c4b2c", label: "Ground Color" },
  groundShadowColor: { value: "#13121a", label: "Ground Shadow Color" },
  shadowPlaneEnabled: { value: true, label: "Shadow Plane Enabled" },
  shadowPlaneColor: { value: "#10163d", label: "Shadow Plane Color" },
  lightPitch: { value: 60, min: 0, max: 90, step: 1, label: "Light Pitch (°)" },
  lightYaw: { value: 130, min: 0, max: 360, step: 1, label: "Light Yaw (°)" }
} satisfies Schema;

export const leafColorsSchema = {
  leafBaseColor: { value: "#458052", label: "Base Color" },
  leafShadowColor: { value: "#1f3438", label: "Shadow Color" },
  leafSubsurfaceColor: { value: "#b7ff00", label: "Subsurface Color" }
} satisfies Schema;

export const flowerColorsSchema = {
  flowerBaseColor: { value: "#a8b2f8", label: "Base Color" },
  flowerShadowColor: { value: "#5258ba", label: "Shadow Color" },
  flowerSubsurfaceColor: { value: "#6300ff", label: "Subsurface Color" }
} satisfies Schema;

export const flowersSchema = {
  fCount: { value: 28, min: 0, max: 50, step: 1 },
  fMatureAge: { value: 30, min: 1, max: 200, step: 1 },
  fBasePitch: { value: -0.2, min: -Math.PI, max: Math.PI },
  fAgePitch: { value: 1.6, min: 0, max: Math.PI },
  fDyingPitch: { value: 1, min: 0, max: Math.PI },
  fBaseYaw: { value: GOLDEN_ANGLE, min: 0, max: Math.PI },
  fLayerHeight: { value: 0.04, min: 0, max: 0.1 },
  fSpacingPower: { value: 1.5, min: 0.1, max: 5 },
  fMinScale: { value: 0.3, min: 0, max: 1 },
  fMinThickness: { value: 0.9, min: 0, max: 1 },
  fColorPower: { value: 2, min: 0.25, max: 6 }
} satisfies Schema;

export const stemSchema = {
  stemCurveAmount: { value: 1, min: 0, max: 3, label: "Curve Amount" },
  stemCurvePower: { value: 2, min: 0.5, max: 5, label: "Curve Ramp Power" },
  stemMinThickness: { value: 0.8, min: 0, max: 1, label: "Min Thickness" }
} satisfies Schema;

export const potColorsSchema = {
  potBaseColor: { value: "#ad826c", label: "Base Color" },
  potShadowColor: { value: "#201d2e", label: "Shadow Color" }
} satisfies Schema;

export const potDimensionsSchema = {
  potHeight: { value: 0.4, min: 0.1, max: 2.0, step: 0.05, label: "Height" },
  potBottomRadius: {
    value: 0.15,
    min: 0.1,
    max: 1.0,
    step: 0.05,
    label: "Bottom Radius"
  },
  potTopRadius: {
    value: 0.25,
    min: 0.1,
    max: 1.0,
    step: 0.05,
    label: "Top Radius"
  },
  potRimHeight: {
    value: 0.11,
    min: 0.01,
    max: 0.5,
    step: 0.01,
    label: "Rim Height"
  },
  potRimThickness: {
    value: 0.025,
    min: 0.01,
    max: 0.2,
    step: 0.01,
    label: "Rim Thickness"
  },
  potThickness: {
    value: 0.01,
    min: 0.01,
    max: 0.1,
    step: 0.01,
    label: "Wall Thickness"
  }
} satisfies Schema;
