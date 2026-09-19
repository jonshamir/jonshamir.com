"use client";

import { useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { Button } from "../../../components/Button";
import { FeatherIcon } from "../../../components/FeatherIcon/FeatherIcon";
import type { ControlValues } from "../../../lib/tweakpane";
import { downloadJson } from "../../../utils/downloadJson";
import {
  applyPreset,
  capturePreset,
  defaultPreset,
  type FruitPreset,
  parsePreset,
  PRESET_VERSION,
  presetFilename,
  PRESETS_STORAGE_KEY
} from "./fruitPresets";
import styles from "./PresetBar.module.css";
import builtIns from "./presets.json";

const BUILT_IN: Record<string, ControlValues> = builtIns;

const ICON_SIZE = 20;

type SavedPresets = Record<string, FruitPreset>;

export function PresetBar() {
  const [saved, setSaved] = useLocalStorage<SavedPresets>(
    PRESETS_STORAGE_KEY,
    {}
  );
  const [selected, setSelected] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const savedNames = Object.keys(saved);
  const isBuiltIn = selected in BUILT_IN;

  const flash = (message: string) => {
    setStatus(message);
    setTimeout(() => setStatus(null), 2500);
  };

  const select = (value: string) => {
    setSelected(value);
    if (!value) return;

    const preset = BUILT_IN[value]
      ? {
          version: PRESET_VERSION,
          lab: "fruit" as const,
          values: BUILT_IN[value]
        }
      : saved[value];

    if (!preset) return;
    applyPreset(preset);
    setName(value);
  };

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      flash("Name it first");
      return;
    }
    if (trimmed in BUILT_IN) {
      flash("That name is taken");
      return;
    }

    setSaved({ ...saved, [trimmed]: capturePreset(trimmed) });
    setSelected(trimmed);
    flash("Saved");
  };

  const remove = () => {
    if (!selected || isBuiltIn) return;
    setSaved(
      Object.fromEntries(
        Object.entries(saved).filter(([key]) => key !== selected)
      )
    );
    setSelected("");
    flash("Deleted");
  };

  const download = () => {
    const label = name.trim() || selected || "preset";
    downloadJson(capturePreset(label), presetFilename(label));
  };

  const open = async (file: File) => {
    try {
      const preset = parsePreset(JSON.parse(await file.text()));
      if (!preset) {
        flash("Not a fruit preset");
        return;
      }
      applyPreset(preset);
      if (preset.name) setName(preset.name);
      setSelected("");
      flash("Loaded");
    } catch {
      flash("Could not read that file");
    }
  };

  const reset = () => {
    applyPreset(defaultPreset());
    setSelected("");
    flash("Reset");
  };

  return (
    // Positioning comes from the global class — see src/styles/three-canvas.css.
    <div className={`${styles.bar} preset-bar-host`}>
      <select
        className={styles.select}
        value={selected}
        onChange={(event) => select(event.target.value)}
        aria-label="Preset"
      >
        <option value="">Presets…</option>
        <optgroup label="Built in">
          {Object.keys(BUILT_IN).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </optgroup>
        {savedNames.length > 0 && (
          <optgroup label="Saved">
            {savedNames.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </optgroup>
        )}
      </select>

      <input
        className={styles.input}
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Name"
        aria-label="Preset name"
      />

      <div className={styles.row}>
        <Button onClick={save} aria-label="Save preset">
          <FeatherIcon iconName="save" size={ICON_SIZE} />
        </Button>
        <Button onClick={download} aria-label="Download preset">
          <FeatherIcon iconName="download" size={ICON_SIZE} />
        </Button>
        <Button
          onClick={() => fileRef.current?.click()}
          aria-label="Load preset from file"
        >
          <FeatherIcon iconName="upload" size={ICON_SIZE} />
        </Button>
        <Button onClick={reset} aria-label="Reset to defaults">
          <FeatherIcon iconName="rotate-ccw" size={ICON_SIZE} />
        </Button>
        <Button
          onClick={remove}
          disabled={!selected || isBuiltIn}
          aria-label="Delete preset"
        >
          <FeatherIcon iconName="trash-2" size={ICON_SIZE} />
        </Button>
      </div>

      <input
        ref={fileRef}
        className={styles.file}
        type="file"
        accept="application/json,.json"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void open(file);
          // Clear it so picking the same file twice still fires a change.
          event.target.value = "";
        }}
      />

      <p className={styles.status} role="status">
        {status}
      </p>
    </div>
  );
}
