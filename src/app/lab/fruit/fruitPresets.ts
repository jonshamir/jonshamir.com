import { createPresetStore } from "../../../lib/presets/presetStore";
import type { ControlValues } from "../../../lib/tweakpane";
import {
  colorSchema,
  grainSchema,
  motionSchema,
  shadingSchema,
  shapeSchema,
  subdivisionSchema,
  topSchema
} from "./fruitControls";
import {
  LEGACY_DEFAULTS,
  migrateFiveAnchorShape,
  migrateLegacyShape
} from "./legacyProfile";

// Older presets described the profile with bulge/flare/tension sliders
// (version 1) or five anchors (version 2).
function migrate(values: ControlValues): ControlValues | null {
  const shape = values.Shape;
  if (shape && "bulge" in shape) {
    return { ...values, Shape: migrateLegacyShape(legacyShapeValues(shape)) };
  }
  if (shape && "lowerX" in shape) {
    return { ...values, Shape: migrateFiveAnchorShape(shape) };
  }
  return null;
}

function legacyShapeValues(shape: Record<string, unknown>) {
  return Object.fromEntries(
    Object.keys(LEGACY_DEFAULTS)
      .filter((key) => typeof shape[key] === "number")
      .map((key) => [key, shape[key]])
  );
}

export const fruitPresets = createPresetStore({
  lab: "fruit",
  version: 3,
  folders: {
    Colors: colorSchema,
    Shape: shapeSchema,
    Subdivisions: subdivisionSchema,
    Top: topSchema,
    Shading: shadingSchema,
    Grain: grainSchema,
    Motion: motionSchema
  },
  migrate
});
