// src/app/lab/campfire/simulation/combustion.ts
import {
  CHAR_RATE_MAX,
  CP_WOOD,
  DELTA_HC,
  HRRPUA,
  RHO_WOOD,
  T_FLAME_MAX,
  T_IGNITE
} from "./constants";
import type { SurfaceField } from "./types";

export interface CombustOptions {
  dt: number; // s
  dxU: number; // m, texel circumferential pitch
  dxV: number; // m, texel longitudinal pitch
  skinThickness: number; // m, nominal surface layer thickness for heating math
}

export function combustStep(field: SurfaceField, opts: CombustOptions): void {
  const { dt, dxU, dxV, skinThickness } = opts;
  const texelArea = dxU * dxV; // m^2
  const texelMass = RHO_WOOD * texelArea * skinThickness; // kg
  const heatCap = texelMass * CP_WOOD; // J/K

  // Burn rate from HRRPUA, normalised to fuel-fraction-per-second:
  //   power (W) = HRRPUA * texelArea
  //   mass-loss (kg/s) = power / DELTA_HC
  //   dFuelFrac/dt = (HRRPUA * texelArea) / (DELTA_HC * texelMass)
  const fuelDecayRate = (HRRPUA * texelArea) / (DELTA_HC * texelMass); // 1/s

  for (let i = 0; i < field.temperature.length; i++) {
    const T = field.temperature[i];
    if (T < T_IGNITE) continue;

    // Pyrolysis blackens the surface while it's hot, independent of fuel.
    const heatFactor = Math.min(1, (T - T_IGNITE) / (T_FLAME_MAX - T_IGNITE));
    field.char[i] = Math.min(1, field.char[i] + CHAR_RATE_MAX * heatFactor * dt);

    const fuel = field.fuel[i];
    if (fuel <= 0) continue;

    const burnFrac = Math.min(fuel, fuelDecayRate * dt);
    field.fuel[i] = fuel - burnFrac;

    const energy = burnFrac * texelMass * DELTA_HC; // J
    const dT = energy / heatCap;
    field.temperature[i] = Math.min(T_FLAME_MAX, T + dT);
  }
}
