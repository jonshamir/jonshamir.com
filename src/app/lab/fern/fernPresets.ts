import { createPresetStore } from "../../../lib/presets/presetStore";
import { createPresetTransition } from "../../../lib/presets/presetTransition";
import {
  frondSchema,
  outlineSchema,
  pinnaeSchema,
  pinnulesSchema,
  renderSchema,
  segmentsSchema
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
    Render: renderSchema
  }
});

export const fernTransition = createPresetTransition(fernPresets);
