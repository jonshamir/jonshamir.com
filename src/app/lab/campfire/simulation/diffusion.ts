import { D_SURFACE, T_AMBIENT } from "./constants";
import type { SurfaceField } from "./types";

export interface DiffuseOptions {
  dt: number; // s
  dxU: number; // m, texel circumferential pitch
  dxV: number; // m, texel longitudinal pitch
  lambdaLoss: number; // 1/s, convective loss coefficient
  diffusivity?: number; // m^2/s, defaults to D_SURFACE
}

// In-place 5-point Laplacian + Newtonian cooling on the temperature field.
// Periodic in U, clamped in V. Uses a scratch buffer to avoid in-place hazards.
let scratch: Float32Array | null = null;

export function diffuseSurface(field: SurfaceField, opts: DiffuseOptions): void {
  const { width, height, temperature } = field;
  const { dt, dxU, dxV, lambdaLoss } = opts;
  const D = opts.diffusivity ?? D_SURFACE;
  const n = width * height;
  if (!scratch || scratch.length < n) scratch = new Float32Array(n);

  const cU = D / (dxU * dxU);
  const cV = D / (dxV * dxV);

  for (let v = 0; v < height; v++) {
    const vUp = v === 0 ? v : v - 1; // clamp
    const vDown = v === height - 1 ? v : v + 1; // clamp
    for (let u = 0; u < width; u++) {
      const uLeft = (u - 1 + width) % width; // wrap
      const uRight = (u + 1) % width; // wrap
      const i = v * width + u;
      const t = temperature[i];
      const lap =
        cU * (temperature[v * width + uLeft] + temperature[v * width + uRight] - 2 * t) +
        cV * (temperature[vUp * width + u] + temperature[vDown * width + u] - 2 * t);
      const loss = lambdaLoss * (t - T_AMBIENT);
      scratch[i] = t + dt * (lap - loss);
    }
  }
  temperature.set(scratch.subarray(0, n));
}
