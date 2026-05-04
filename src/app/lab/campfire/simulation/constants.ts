// src/app/lab/campfire/simulation/constants.ts
// All values SI; temperatures in Kelvin.

export const T_AMBIENT = 293; // K
export const T_IGNITE = 600; // K
export const T_FLAME_MAX = 1500; // K

export const RHO_WOOD = 500; // kg/m^3
export const CP_WOOD = 1700; // J/(kg*K)
export const K_WOOD = 0.15; // W/(m*K)

export const DELTA_HC = 17.5e6; // J/kg
export const HRRPUA = 180e3; // W/m^2
export const BETA_CHAR = 1.08e-5; // m/s (0.65 mm/min)
export const H_CONV = 15; // W/(m^2*K)

export const D_SURFACE = 5e-6; // m^2/s — TUNE empirically
export const MIN_RADIUS = 0.0005; // m, burn-through threshold

export const SIM_HZ = 30;
export const SIM_DT = 1 / SIM_HZ;

// Segment lifecycle thresholds
export const T_HEATING = 400; // K
export const T_FLAMING_MIN_FUEL_FRAC = 0.0; // any fuel + flaming texels
export const FUEL_FRAC_EMBERING = 0.2;
export const FUEL_FRAC_ASH = 0.01;
