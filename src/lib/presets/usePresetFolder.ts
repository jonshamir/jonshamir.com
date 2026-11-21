import type { FolderApi } from "@tweakpane/core";
import { useEffect } from "react";
import type { ListBladeApi, TextBladeApi } from "tweakpane";

import { downloadJson } from "../../utils/downloadJson";
import { type ControlValues, getPane } from "../tweakpane";
import type { Preset, PresetStore, SavedPresets } from "./presetStore";
import type { PresetTransition } from "./presetTransition";

const TITLE = "Presets";
const NONE = "";
const FLASH_MS = 2000;

// Built imperatively rather than through useControls: the list's options change
// as presets are saved, which the bind-once schema system can't express.
export function usePresetFolder(
  store: PresetStore,
  builtIns: Record<string, ControlValues>,
  transition: PresetTransition
): void {
  useEffect(() => {
    const pane = getPane();
    const folder: FolderApi = pane.addFolder({ title: TITLE, expanded: false });

    let saved = store.loadSaved();
    let selected = NONE;
    let name = "";
    let syncing = false;

    const listOptions = () => [
      { text: "—", value: NONE },
      ...Object.keys(builtIns).map((key) => ({ text: key, value: key })),
      ...Object.keys(saved).map((key) => ({ text: `${key} ·`, value: key }))
    ];

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
      options: listOptions()
    }) as unknown as ListBladeApi<string>;

    const nameField = folder.addBlade({
      view: "text",
      label: "Name",
      value: "",
      parse: (value: unknown) => String(value)
    }) as unknown as TextBladeApi<string>;

    const setList = (value: string) => {
      syncing = true;
      list.options = listOptions();
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

      const preset: Preset | undefined = builtIns[selected]
        ? store.fromValues(builtIns[selected])
        : saved[selected];

      if (!preset) return;
      transition.transitionTo(preset);
      setName(selected);
    });

    nameField.on("change", (event) => {
      name = event.value;
    });

    folder.addButton({ title: "Save" }).on("click", () => {
      const trimmed = name.trim();
      if (!trimmed) {
        flash("name it first");
        return;
      }
      if (trimmed in builtIns) {
        flash("name taken");
        return;
      }

      saved = { ...saved, [trimmed]: store.capture(trimmed) };
      store.storeSaved(saved);
      selected = trimmed;
      setList(trimmed);
      flash("saved");
    });

    folder.addButton({ title: "Download" }).on("click", () => {
      const label = name.trim() || selected || "preset";
      downloadJson(store.capture(label), store.filename(label));
    });

    folder.addButton({ title: "Load file" }).on("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";
      input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (!file) return;

        void file
          .text()
          .then((text) => {
            const preset = store.parse(JSON.parse(text));
            if (!preset) {
              flash(`not a ${store.lab} preset`);
              return;
            }
            transition.transitionTo(preset);
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

    folder.addButton({ title: "Reset" }).on("click", () => {
      transition.transitionTo(store.defaults());
      selected = NONE;
      setList(NONE);
      flash("reset");
    });

    folder.addButton({ title: "Delete" }).on("click", () => {
      if (!selected) {
        flash("nothing selected");
        return;
      }
      if (selected in builtIns) {
        flash("built in");
        return;
      }

      const next: SavedPresets = {};
      for (const [key, value] of Object.entries(saved)) {
        if (key !== selected) next[key] = value;
      }
      saved = next;
      store.storeSaved(saved);
      selected = NONE;
      setList(NONE);
      flash("deleted");
    });

    return () => {
      if (flashTimer) clearTimeout(flashTimer);
      transition.cancel();
      folder.dispose();
    };
  }, [store, builtIns, transition]);
}
