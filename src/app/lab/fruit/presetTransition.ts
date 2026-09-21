import { Color } from "three/webgpu";

import { easeInOutCubic, lerp } from "../../../lib/math";
import {
  type ControlValues,
  isFolder,
  readControlValues,
  type Schema,
  writeControlValues
} from "../../../lib/tweakpane";
import { applyPreset, FOLDER_SCHEMAS, type FruitPreset } from "./fruitPresets";

const DURATION_MS = 600;

// Read off the schemas rather than inferred from the endpoints: a field whose
// two values happen to be whole numbers (radius 1 -> 2) is not an integer field,
// and rounding it every frame would put a visible step in the middle of it.
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

const STEPS: Record<string, Record<string, number>> = Object.fromEntries(
  Object.entries(FOLDER_SCHEMAS).map(([folder, schema]) => [
    folder,
    collectSteps(schema)
  ])
);

function decimalsOf(step: number): number {
  const text = String(step);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

// toFixed rather than the raw product: Math.round(v / 0.005) * 0.005 lands on
// values like 0.30000000000000004, which Tweakpane renders in full.
function quantize(value: number, step: number | undefined): number {
  if (!step) return value;
  return Number((Math.round(value / step) * step).toFixed(decimalsOf(step)));
}

const HEX = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i;

const fromColor = new Color();
const toColor = new Color();

function lerpHex(from: string, to: string, t: number): string {
  const a = HEX.exec(from);
  const b = HEX.exec(to);
  if (!a || !b) return t < 0.5 ? from : to;

  // lerpHSL takes the shortest way round the wheel, so red -> yellow travels
  // through orange instead of desaturating through grey on the way.
  fromColor.set(`#${a[1]}`);
  toColor.set(`#${b[1]}`);
  fromColor.lerpHSL(toColor, t);
  const hex = `#${fromColor.getHexString()}`;

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

  // Booleans and list values have no midpoint, so they change over at one.
  return t < 0.5 ? from : to;
}

// Only the folders and keys the preset mentions are touched — every built-in in
// presets.json is partial, and writeControlValues leaves the rest alone.
function blend(
  from: ControlValues,
  target: ControlValues,
  t: number
): ControlValues {
  const out: ControlValues = {};

  for (const [folder, group] of Object.entries(target)) {
    const current = from[folder] ?? {};
    const steps = STEPS[folder] ?? {};
    const blended: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(group)) {
      blended[key] = interpolate(current[key], value, t, steps[key]);
    }

    out[folder] = blended;
  }

  return out;
}

let frame: number | undefined;

export function cancelPresetTransition(): void {
  if (frame === undefined) return;
  cancelAnimationFrame(frame);
  frame = undefined;
}

// Drives the controls themselves rather than anything downstream of them, so the
// pane's sliders sweep along with the mesh and capturePreset stays truthful
// mid-flight. One frame here is the same work as one frame of a slider drag.
export function transitionToPreset(preset: FruitPreset): void {
  cancelPresetTransition();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    applyPreset(preset);
    return;
  }

  // Taken from where the controls are now, not from the preset we were last
  // heading for, so interrupting re-aims from the visible state.
  const from = readControlValues();
  const start = performance.now();

  const tick = (now: number) => {
    const t = Math.min((now - start) / DURATION_MS, 1);

    if (t < 1) {
      writeControlValues(blend(from, preset.values, easeInOutCubic(t)));
      frame = requestAnimationFrame(tick);
      return;
    }

    // Verbatim on the last frame: the end state is the preset exactly, not a
    // quantized lerp that landed near it.
    frame = undefined;
    applyPreset(preset);
  };

  frame = requestAnimationFrame(tick);
}
