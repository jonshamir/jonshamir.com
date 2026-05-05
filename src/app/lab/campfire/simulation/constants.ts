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
// Char-through rate. Real wood is ~0.65 mm/min (1.08e-5 m/s), but the
// per-texel fuel mechanism in combustStep depletes a surface texel's fuel
// in ~50 s of full combustion. To let a thin segment actually char-through
// during its single combustion window before its skin cools, we accelerate
// this to 1e-4 m/s (~6 mm/min, ~10× real). This is a "lab" rate consistent
// with the time-scale slider used to make the burn observable.
export const BETA_CHAR = 1e-4; // m/s
// Pyrolysis blackening rate at maximum surface temperature. Char accumulates
// while the surface is hot, independent of fuel — a sustained flaming texel
// reaches char≈1 in ~1 s of sim time.
export const CHAR_RATE_MAX = 1.0; // 1/s
export const H_CONV = 15; // W/(m^2*K)
// Effective skin-to-bulk radial conductance. Real char layer has very low
// conductivity (~0.05 W/m·K) and grows during burning, so the effective
// skin-bulk coupling is much weaker than naive k_wood / skinThickness.
// At H≈30, drain at ΔT=1200 is 36 kW/m² — well below HRRPUA (180 kW/m²)
// so a flaming surface stays hot, while bulk still warms cumulatively.
export const H_INTERNAL = 30; // W/(m^2*K)

export const D_SURFACE = 1e-5; // m^2/s — TUNE empirically
export const MIN_RADIUS = 0.0005; // m, burn-through threshold

export const SIM_HZ = 30;
export const SIM_DT = 1 / SIM_HZ;

// Segment lifecycle thresholds
export const T_HEATING = 400; // K
export const T_FLAMING_MIN_FUEL_FRAC = 0.0; // any fuel + flaming texels
export const FUEL_FRAC_EMBERING = 0.2;
export const FUEL_FRAC_ASH = 0.01;
