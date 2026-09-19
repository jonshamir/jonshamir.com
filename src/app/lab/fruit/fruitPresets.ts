import {
  type ControlValues,
  readControlValues,
  schemaDefaults,
  writeControlValues
} from "../../../lib/tweakpane";
import {
  colorSchema,
  grainSchema,
  shadingSchema,
  shapeSchema,
  subdivisionSchema,
  topSchema
} from "./fruitControls";

export const PRESET_VERSION = 1;

// Folder titles as passed to useControls in FruitCanvas. Capturing through this
// list rather than taking everything registered means a control group belonging
// to another lab can never end up in a fruit preset.
const FOLDER_SCHEMAS = {
  Colors: colorSchema,
  Shape: shapeSchema,
  Subdivisions: subdivisionSchema,
  Top: topSchema,
  Shading: shadingSchema,
  Grain: grainSchema
};

const FRUIT_FOLDERS = Object.keys(FOLDER_SCHEMAS);

export type FruitPreset = {
  version: number;
  lab: "fruit";
  name?: string;
  values: ControlValues;
};

export const PRESETS_STORAGE_KEY = "fruit-presets";
export const SESSION_STORAGE_KEY = "fruit-session";

export function capturePreset(name?: string): FruitPreset {
  const all = readControlValues();
  const values: ControlValues = {};

  for (const folder of FRUIT_FOLDERS) {
    if (all[folder]) values[folder] = { ...all[folder] };
  }

  return { version: PRESET_VERSION, lab: "fruit", name, values };
}

export function applyPreset(preset: FruitPreset): void {
  writeControlValues(preset.values);
}

export function defaultPreset(): FruitPreset {
  const values: ControlValues = {};

  for (const [folder, schema] of Object.entries(FOLDER_SCHEMAS)) {
    values[folder] = schemaDefaults(schema);
  }

  return { version: PRESET_VERSION, lab: "fruit", name: "Default", values };
}

// Structural check only — individual values are not validated, because
// writeControlValues already ignores keys it has no binding for. Returns null
// rather than throwing so callers can show a message.
export function parsePreset(input: unknown): FruitPreset | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }

  const candidate = input as Partial<FruitPreset>;
  if (candidate.lab !== "fruit") return null;
  if (typeof candidate.version !== "number") return null;

  const values = candidate.values;
  if (typeof values !== "object" || values === null || Array.isArray(values)) {
    return null;
  }

  // Every folder entry has to be a plain object, or writeControlValues would
  // iterate something it can't use.
  const usable: ControlValues = {};
  for (const [folder, group] of Object.entries(values)) {
    if (typeof group === "object" && group !== null && !Array.isArray(group)) {
      usable[folder] = group;
    }
  }

  return {
    version: candidate.version,
    lab: "fruit",
    name: typeof candidate.name === "string" ? candidate.name : undefined,
    values: usable
  };
}

export type SavedPresets = Record<string, FruitPreset>;

// Plain localStorage rather than a hook: the preset UI lives in the Tweakpane
// pane now, so none of this drives a React render. Matches the direct access in
// src/features/color-mode/useColorMode.ts.
export function loadSavedPresets(): SavedPresets {
  try {
    const raw = window.localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    const out: SavedPresets = {};
    for (const [name, value] of Object.entries(parsed)) {
      const preset = parsePreset(value);
      if (preset) out[name] = preset;
    }
    return out;
  } catch {
    return {};
  }
}

export function storeSavedPresets(presets: SavedPresets): void {
  try {
    window.localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // Private mode or a full quota — the in-memory list still works.
  }
}

export function presetFilename(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `fruit-${slug || "preset"}.json`;
}
