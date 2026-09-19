// src/lib/tweakpane/registry.ts
import type { BindingApi } from "@tweakpane/core";

// Folder key used for controls bound directly on the root pane.
export const ROOT_GROUP = "$root";

export type ControlGroup = {
  folder: string;
  store: Record<string, unknown>;
  bindings: Map<string, BindingApi>;
};

export type ControlValues = Record<string, Record<string, unknown>>;

// Live groups, one per mounted useControls call. useControls owns registration;
// nothing else should add to this. An array rather than a Set because the
// project targets es5, where iterating a Set needs downlevelIteration.
const groups: ControlGroup[] = [];

export function registerControlGroup(group: ControlGroup): () => void {
  groups.push(group);
  return () => {
    const index = groups.indexOf(group);
    if (index !== -1) groups.splice(index, 1);
  };
}

// Current values of every mounted group, namespaced by folder title. Nested
// folders within a schema are already flattened by useControls, but titles are
// only unique per group, so the namespacing is what keeps two labs' controls
// from colliding.
export function readControlValues(): ControlValues {
  const out: ControlValues = {};
  for (const group of groups) {
    out[group.folder] = { ...(out[group.folder] ?? {}), ...group.store };
  }
  return out;
}

// Push values back into the pane. Writing to the store is not enough on its
// own: refresh() is what makes Tweakpane re-read it, and it fires the binding's
// change event, so useControls' own handler syncs React for us.
//
// Deliberately tolerant. Keys with no matching binding are skipped and controls
// the caller didn't mention keep their current value, so a partial or outdated
// preset applies as far as it can instead of failing.
export function writeControlValues(next: ControlValues): void {
  for (const group of groups) {
    const incoming = next[group.folder];
    if (!incoming) continue;

    for (const [key, value] of Object.entries(incoming)) {
      const binding = group.bindings.get(key);
      if (!binding) continue;
      group.store[key] = value;
      binding.refresh();
    }
  }
}
