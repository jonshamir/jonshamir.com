import type { FolderApi } from "@tweakpane/core";
import { useEffect } from "react";
import type { ListBladeApi, TextBladeApi } from "tweakpane";

import { type ControlValues, getPane } from "../../../lib/tweakpane";
import { downloadJson } from "../../../utils/downloadJson";
import {
  capturePreset,
  defaultPreset,
  type FruitPreset,
  loadSavedPresets,
  parsePreset,
  PRESET_VERSION,
  presetFilename,
  type SavedPresets,
  storeSavedPresets
} from "./fruitPresets";
import builtIns from "./presets.json";
import { cancelPresetTransition, transitionToPreset } from "./presetTransition";

const BUILT_IN: Record<string, ControlValues> = builtIns;

const TITLE = "Presets";
const NONE = "";
const FLASH_MS = 2000;

function listOptions(saved: SavedPresets) {
  return [
    { text: "—", value: NONE },
    ...Object.keys(BUILT_IN).map((key) => ({ text: key, value: key })),
    ...Object.keys(saved).map((key) => ({ text: `${key} ·`, value: key }))
  ];
}

// Builds the Presets folder directly on the pane rather than going through
// useControls. The schema system binds once on mount, which can't express a
// list whose options change as presets are saved — ListBladeApi.options is
// settable, so driving the blades imperatively can.
export function usePresetFolder(): void {
  useEffect(() => {
    const pane = getPane();
    const folder: FolderApi = pane.addFolder({ title: TITLE, expanded: false });

    // All mutable state lives here, not in React state: the handlers below are
    // registered once, so anything they read has to be a live reference rather
    // than a captured render value.
    let saved = loadSavedPresets();
    let selected = NONE;
    let name = "";
    // Assigning list.value fires the change handler, which would re-apply the
    // preset we just applied.
    let syncing = false;

    let flashTimer: ReturnType<typeof setTimeout> | undefined;
    const flash = (message: string) => {
      folder.title = `${TITLE} — ${message}`;
      if (flashTimer) clearTimeout(flashTimer);
      flashTimer = setTimeout(() => {
        folder.title = TITLE;
      }, FLASH_MS);
    };

    const list = folder.addBlade({
      view: "list",
      label: "Preset",
      value: NONE,
      options: listOptions(saved)
    }) as unknown as ListBladeApi<string>;

    const nameField = folder.addBlade({
      view: "text",
      label: "Name",
      value: "",
      parse: (value: unknown) => String(value)
    }) as unknown as TextBladeApi<string>;

    const setList = (value: string) => {
      syncing = true;
      list.options = listOptions(saved);
      list.value = value;
      syncing = false;
    };

    const setName = (value: string) => {
      name = value;
      nameField.value = value;
    };

    list.on("change", (event) => {
      if (syncing) return;
      selected = event.value;
      if (!selected) return;

      const preset: FruitPreset | undefined = BUILT_IN[selected]
        ? { version: PRESET_VERSION, lab: "fruit", values: BUILT_IN[selected] }
        : saved[selected];

      if (!preset) return;
      transitionToPreset(preset);
      setName(selected);
    });

    nameField.on("change", (event) => {
      name = event.value;
    });

    const save = folder.addButton({ title: "Save" });
    save.on("click", () => {
      const trimmed = name.trim();
      if (!trimmed) {
        flash("name it first");
        return;
      }
      if (trimmed in BUILT_IN) {
        flash("name taken");
        return;
      }

      saved = { ...saved, [trimmed]: capturePreset(trimmed) };
      storeSavedPresets(saved);
      selected = trimmed;
      setList(trimmed);
      flash("saved");
    });

    const download = folder.addButton({ title: "Download" });
    download.on("click", () => {
      const label = name.trim() || selected || "preset";
      downloadJson(capturePreset(label), presetFilename(label));
    });

    // Created on demand and discarded, so nothing has to be rendered into the
    // pane's DOM to open a file picker.
    const load = folder.addButton({ title: "Load file" });
    load.on("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";
      input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (!file) return;

        void file
          .text()
          .then((text) => {
            const preset = parsePreset(JSON.parse(text));
            if (!preset) {
              flash("not a fruit preset");
              return;
            }
            transitionToPreset(preset);
            if (preset.name) setName(preset.name);
            selected = NONE;
            setList(NONE);
            flash("loaded");
          })
          .catch(() => {
            flash("could not read that file");
          });
      });
      input.click();
    });

    const reset = folder.addButton({ title: "Reset" });
    reset.on("click", () => {
      transitionToPreset(defaultPreset());
      selected = NONE;
      setList(NONE);
      flash("reset");
    });

    const remove = folder.addButton({ title: "Delete" });
    remove.on("click", () => {
      if (!selected) {
        flash("nothing selected");
        return;
      }
      if (selected in BUILT_IN) {
        flash("built in");
        return;
      }

      saved = Object.fromEntries(
        Object.entries(saved).filter(([key]) => key !== selected)
      );
      storeSavedPresets(saved);
      selected = NONE;
      setList(NONE);
      flash("deleted");
    });

    return () => {
      if (flashTimer) clearTimeout(flashTimer);
      // Otherwise an in-flight transition keeps writing after the pane is gone.
      cancelPresetTransition();
      folder.dispose();
    };
  }, []);
}
