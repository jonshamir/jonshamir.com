import { createPresetStore } from "../../../lib/presets/presetStore";
import { createPresetTransition } from "../../../lib/presets/presetTransition";
import {
  colorSchema,
  frondSchema,
  outlineSchema,
  pinnaeSchema,
  pinnulesSchema,
  segmentsSchema,
  shadingSchema,
  venationSchema
} from "./fernControls";

export const fernPresets = createPresetStore({
  lab: "fern",
  version: 1,
  folders: {
    Frond: frondSchema,
    Pinnae: pinnaeSchema,
    Pinnules: pinnulesSchema,
    Segments: segmentsSchema,
    Outline: outlineSchema,
    Venation: venationSchema,
    Shading: shadingSchema,
    Colors: colorSchema
  }
});

export const fernTransition = createPresetTransition(fernPresets);
