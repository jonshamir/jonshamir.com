import {
  type ControlValues,
  readControlValues,
  type Schema,
  schemaDefaults,
  writeControlValues
} from "../tweakpane";

export type Preset = {
  version: number;
  lab: string;
  name?: string;
  values: ControlValues;
};

export type SavedPresets = Record<string, Preset>;

export type PresetStoreConfig = {
  lab: string;
  version: number;
  folders: Record<string, Schema>;
  migrate?: (values: ControlValues) => ControlValues | null;
};

export type PresetStore = ReturnType<typeof createPresetStore>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createPresetStore({
  lab,
  version,
  folders,
  migrate
}: PresetStoreConfig) {
  const folderNames = Object.keys(folders);
  const presetsKey = `${lab}-presets`;
  const sessionKey = `${lab}-session`;

  function capture(name?: string): Preset {
    const all = readControlValues();
    const values: ControlValues = {};
    for (const folder of folderNames) {
      if (all[folder]) values[folder] = { ...all[folder] };
    }
    return { version, lab, name, values };
  }

  function apply(preset: Preset): void {
    writeControlValues(preset.values);
  }

  function defaults(): Preset {
    const values: ControlValues = {};
    for (const [folder, schema] of Object.entries(folders)) {
      values[folder] = schemaDefaults(schema);
    }
    return { version, lab, name: "Default", values };
  }

  function fromValues(values: ControlValues, name?: string): Preset {
    return { version, lab, name, values };
  }

  function parse(input: unknown): Preset | null {
    if (!isRecord(input)) return null;
    if (input.lab !== lab) return null;
    if (typeof input.version !== "number") return null;
    if (!isRecord(input.values)) return null;

    let usable: ControlValues = {};
    for (const [folder, group] of Object.entries(input.values)) {
      if (isRecord(group)) usable[folder] = group;
    }

    let presetVersion = input.version;
    const migrated = migrate?.(usable);
    if (migrated) {
      usable = migrated;
      presetVersion = version;
    }

    return {
      version: presetVersion,
      lab,
      name: typeof input.name === "string" ? input.name : undefined,
      values: usable
    };
  }

  function loadSaved(): SavedPresets {
    try {
      const raw = window.localStorage.getItem(presetsKey);
      if (!raw) return {};
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) return {};

      const out: SavedPresets = {};
      for (const [name, value] of Object.entries(parsed)) {
        const preset = parse(value);
        if (preset) out[name] = preset;
      }
      return out;
    } catch {
      return {};
    }
  }

  function storeSaved(presets: SavedPresets): void {
    try {
      window.localStorage.setItem(presetsKey, JSON.stringify(presets));
    } catch {
      // Private mode or a full quota: the in-memory list still works.
    }
  }

  function filename(name: string): string {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `${lab}-${slug || "preset"}.json`;
  }

  return {
    lab,
    version,
    folders,
    sessionKey,
    capture,
    apply,
    defaults,
    fromValues,
    parse,
    loadSaved,
    storeSaved,
    filename
  };
}
