import { hexToOklch, mixOklch, oklchToHex } from "../color";
import { easeInOutCubic, lerp } from "../math";
import {
  type ControlValues,
  isFolder,
  readControlValues,
  type Schema,
  writeControlValues
} from "../tweakpane";
import type { Preset, PresetStore } from "./presetStore";

export const PRESET_TRANSITION_MS = 600;

export type PresetTransition = {
  transitionTo: (preset: Preset) => void;
  cancel: () => void;
};

// Steps come from the schema, not the endpoints: radius 1 -> 2 is not an
// integer field, and rounding it every frame would step visibly.
function collectSteps(
  schema: Schema,
  out: Record<string, number> = {}
): Record<string, number> {
  for (const [key, node] of Object.entries(schema)) {
    if (isFolder(node)) {
      collectSteps(node.schema, out);
    } else if ("step" in node && typeof node.step === "number") {
      out[key] = node.step;
    }
  }
  return out;
}

function decimalsOf(step: number): number {
  const text = String(step);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

function quantize(value: number, step: number | undefined): number {
  if (!step) return value;
  return Number((Math.round(value / step) * step).toFixed(decimalsOf(step)));
}

const HEX = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i;

function lerpHex(from: string, to: string, t: number): string {
  const a = HEX.exec(from);
  const b = HEX.exec(to);
  if (!a || !b) return t < 0.5 ? from : to;

  const hex = `#${oklchToHex(mixOklch(hexToOklch(a[1]), hexToOklch(b[1]), t))}`;
  if (!a[2] && !b[2]) return hex;

  const alpha = Math.round(
    lerp(parseInt(a[2] ?? "ff", 16), parseInt(b[2] ?? "ff", 16), t)
  );
  return hex + alpha.toString(16).padStart(2, "0");
}

function interpolate(
  from: unknown,
  to: unknown,
  t: number,
  step: number | undefined
): unknown {
  if (from === undefined) return to;

  if (typeof from === "number" && typeof to === "number") {
    return quantize(lerp(from, to, t), step);
  }

  if (
    typeof from === "string" &&
    typeof to === "string" &&
    from.startsWith("#") &&
    to.startsWith("#")
  ) {
    return lerpHex(from, to, t);
  }

  return t < 0.5 ? from : to;
}

export function createPresetTransition(
  store: PresetStore,
  { onStart }: { onStart?: (now: number) => void } = {}
): PresetTransition {
  const steps: Record<string, Record<string, number>> = Object.fromEntries(
    Object.entries(store.folders).map(([folder, schema]) => [
      folder,
      collectSteps(schema)
    ])
  );

  function blend(
    from: ControlValues,
    target: ControlValues,
    t: number
  ): ControlValues {
    const out: ControlValues = {};
    for (const [folder, group] of Object.entries(target)) {
      const current = from[folder] ?? {};
      const folderSteps = steps[folder] ?? {};
      const blended: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(group)) {
        blended[key] = interpolate(current[key], value, t, folderSteps[key]);
      }
      out[folder] = blended;
    }
    return out;
  }

  let frame: number | undefined;

  function cancel(): void {
    if (frame === undefined) return;
    cancelAnimationFrame(frame);
    frame = undefined;
  }

  function transitionTo(preset: Preset): void {
    cancel();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      store.apply(preset);
      return;
    }

    const from = readControlValues();
    const start = performance.now();
    onStart?.(start);

    const tick = (now: number) => {
      const t = Math.min((now - start) / PRESET_TRANSITION_MS, 1);
      if (t < 1) {
        writeControlValues(blend(from, preset.values, easeInOutCubic(t)));
        frame = requestAnimationFrame(tick);
        return;
      }
      frame = undefined;
      store.apply(preset);
    };

    frame = requestAnimationFrame(tick);
  }

  return { transitionTo, cancel };
}
