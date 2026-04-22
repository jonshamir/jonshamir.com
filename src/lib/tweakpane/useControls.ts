// src/lib/tweakpane/useControls.ts
import type { FolderApi } from "@tweakpane/core";
import { useEffect, useState } from "react";

import { type FolderNode, isFolder } from "./folder";
import { getPane } from "./pane";
import type { Field, Schema } from "./types";

type Values = Record<string, unknown>;
type FolderOpts = { collapsed?: boolean };

// Overloads mirror Leva's API.
export function useControls(schema: Schema): Values;
export function useControls(
  folderName: string,
  schema: Schema,
  opts?: FolderOpts
): Values;
export function useControls(
  arg1: Schema | string,
  arg2?: Schema,
  arg3?: FolderOpts
): Values {
  const folderName = typeof arg1 === "string" ? arg1 : undefined;
  const schema = (typeof arg1 === "string" ? arg2 : arg1) as Schema;
  const folderOpts = typeof arg1 === "string" ? arg3 : undefined;

  // Snapshot of current values. Updated when Tweakpane writes to the store.
  const [values, setValues] = useState<Values>(() => collectDefaults(schema));

  useEffect(() => {
    const pane = getPane();
    const store: Values = { ...values };

    const root: FolderApi = folderName
      ? pane.addFolder({ title: folderName, expanded: !folderOpts?.collapsed })
      : (pane as unknown as FolderApi);

    const disposers: Array<() => void> = [];
    bindSchema(
      root,
      schema,
      store,
      () => {
        setValues({ ...store });
      },
      disposers
    );

    return () => {
      for (const d of disposers) d();
      if (folderName && root !== (pane as unknown as FolderApi)) {
        root.dispose();
      }
    };
    // Hook is called with stable schemas (usually inline literals that are
    // stable across renders in these call sites, or useMemo'd). We deliberately
    // omit deps — re-binding on every render would thrash the UI.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return values;
}

function collectDefaults(schema: Schema, out: Values = {}): Values {
  for (const [key, node] of Object.entries(schema)) {
    if (isFolder(node)) {
      collectDefaults(node.schema, out);
    } else {
      out[key] = node.value;
    }
  }
  return out;
}

function bindSchema(
  parent: FolderApi,
  schema: Schema,
  store: Values,
  onChange: () => void,
  disposers: Array<() => void>
): void {
  for (const [key, node] of Object.entries(schema)) {
    if (isFolder(node)) {
      const f: FolderNode = node;
      const sub = parent.addFolder({
        title: key,
        expanded: !f.opts.collapsed
      });
      bindSchema(sub, f.schema, store, onChange, disposers);
      disposers.push(() => sub.dispose());
    } else {
      addBinding(parent, key, node, store, onChange, disposers);
    }
  }
}

function addBinding(
  parent: FolderApi,
  key: string,
  field: Field,
  store: Values,
  onChange: () => void,
  disposers: Array<() => void>
): void {
  const opts: Record<string, unknown> = {};
  if (field.label !== undefined) opts.label = field.label;

  if (typeof field.value === "number") {
    const f = field;
    if (f.min !== undefined) opts.min = f.min;
    if (f.max !== undefined) opts.max = f.max;
    if (f.step !== undefined) opts.step = f.step;
  } else if (typeof field.value === "string" && field.value.startsWith("#")) {
    opts.view = "color";
  } else if (
    typeof field.value === "object" &&
    field.value !== null &&
    "x" in field.value &&
    "y" in field.value
  ) {
    const f = field;
    if (f.x) opts.x = f.x;
    if (f.y) opts.y = f.y;
  }

  store[key] = field.value;
  const binding = parent.addBinding(store, key, opts);
  binding.on("change", onChange);
  disposers.push(() => binding.dispose());
}
