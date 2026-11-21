import { easeInOutQuint } from "../../../lib/math";
import {
  createPresetTransition,
  PRESET_TRANSITION_MS
} from "../../../lib/presets/presetTransition";
import { fruitPresets } from "./fruitPresets";

const SPIN = Math.PI * 2;
let spinFrom = 0;
let spinStart: number | undefined;

export function spinOffset(now: number): number {
  if (spinStart === undefined) return spinFrom;
  const t = Math.min((now - spinStart) / PRESET_TRANSITION_MS, 1);
  return spinFrom + SPIN * easeInOutQuint(t);
}

export const fruitTransition = createPresetTransition(fruitPresets, {
  onStart: (now) => {
    spinFrom = spinOffset(now) % SPIN;
    spinStart = now;
  }
});
