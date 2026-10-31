import { clamp, lerp } from "./math";

export type Oklch = { l: number; c: number; h: number };

const TAU = Math.PI * 2;

function srgbToLinear(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linearToSrgb(v: number): number {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

// Ottosson's Oklab matrices.
function linearToOklab(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ];
}

function oklabToLinear(
  L: number,
  A: number,
  B: number
): [number, number, number] {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ];
}

export function hexToOklch(hex: string): Oklch {
  const n = parseInt(hex, 16);
  const [L, A, B] = linearToOklab(
    srgbToLinear(((n >> 16) & 255) / 255),
    srgbToLinear(((n >> 8) & 255) / 255),
    srgbToLinear((n & 255) / 255)
  );
  return { l: L, c: Math.hypot(A, B), h: Math.atan2(B, A) };
}

function inGamut([r, g, b]: [number, number, number]): boolean {
  const e = 1e-5;
  return (
    r >= -e && r <= 1 + e && g >= -e && g <= 1 + e && b >= -e && b <= 1 + e
  );
}

// Preserves lightness and hue and gives up chroma, so a mix that overshoots
// sRGB desaturates instead of skewing hue the way per-channel clamping does.
function clipChroma({ l, c, h }: Oklch): [number, number, number] {
  const at = (chroma: number) =>
    oklabToLinear(l, Math.cos(h) * chroma, Math.sin(h) * chroma);

  const rgb = at(c);
  if (inGamut(rgb)) return rgb;

  let lo = 0;
  let hi = c;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(at(mid))) lo = mid;
    else hi = mid;
  }
  return at(lo);
}

export function oklchToHex(color: Oklch): string {
  return clipChroma(color)
    .map((v) =>
      Math.round(clamp(linearToSrgb(v), 0, 1) * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}

export function mixOklch(from: Oklch, to: Oklch, t: number): Oklch {
  // A near-neutral colour has no meaningful hue, so it borrows the other end's
  // rather than dragging the arc towards whatever atan2 happened to return.
  const fromHue = from.c < 1e-4 ? to.h : from.h;
  const toHue = to.c < 1e-4 ? from.h : to.h;
  let delta = (toHue - fromHue) % TAU;
  if (delta > Math.PI) delta -= TAU;
  else if (delta < -Math.PI) delta += TAU;

  return {
    l: lerp(from.l, to.l, t),
    c: lerp(from.c, to.c, t),
    h: fromHue + delta * t
  };
}
