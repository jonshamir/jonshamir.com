// Master "Focus" param — drives distortion knobs along independent
// 0→1 curves. Tune `FOCUS_PARAMS` below to change start/end/easing per param.

export type EaseFn = (t: number) => number;

// Reusable easing helpers — feel free to ignore these and write your own
// inline `(t) => ...` curve directly in FOCUS_PARAMS.
export const linear: EaseFn = (t) => t;
export const easeIn: EaseFn = (t) => t * t * t;
export const easeInExp: EaseFn = (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10));
export const easeOut: EaseFn = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOut: EaseFn = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export type FocusParamKey =
  | "sizeScale"
  | "shapeStrength"
  | "sizeUniformity"
  | "noiseAmp";

export type FocusParams = Record<FocusParamKey, number>;

type FocusSpec = { start: number; end: number; easing: EaseFn };

// Per-parameter mapping. `start` is the value at focus=0, `end` at focus=1,
// `easing` is any (t: 0..1) => 0..1 function. Adjust freely.
export const FOCUS_PARAMS: Record<FocusParamKey, FocusSpec> = {
  sizeScale: { start: 4.0, end: 1.0, easing: easeIn },
  shapeStrength: { start: 1.0, end: 0.0, easing: easeInExp },
  sizeUniformity: { start: 1.0, end: 0.0, easing: easeInExp },
  noiseAmp: { start: 6.0, end: 0.0, easing: linear }
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function mapFocus(focus: number): FocusParams {
  const f = Math.max(0, Math.min(1, focus));
  const out = {} as FocusParams;
  (Object.keys(FOCUS_PARAMS) as FocusParamKey[]).forEach((key) => {
    const { start, end, easing } = FOCUS_PARAMS[key];
    out[key] = lerp(start, end, easing(f));
  });
  return out;
}
