import {
  BETA_CHAR,
  CP_WOOD,
  FUEL_FRAC_ASH,
  FUEL_FRAC_EMBERING,
  H_INTERNAL,
  K_WOOD,
  MIN_RADIUS,
  RHO_WOOD,
  T_AMBIENT,
  T_HEATING,
  T_IGNITE
} from "./constants";
import { averageInVRange, sumInVRange } from "./surfaceField";
import type { Segment, SurfaceField } from "./types";

export interface BuildSegmentsOptions {
  length: number; // m, total log length
  radius: number; // m
  segmentCount: number;
}

export function buildSegments(opts: BuildSegmentsOptions): Segment[] {
  const { length, radius, segmentCount } = opts;
  const segLen = length / segmentCount;
  const segVolume = Math.PI * radius * radius * segLen;
  const segMass = RHO_WOOD * segVolume;
  const segs: Segment[] = [];
  for (let i = 0; i < segmentCount; i++) {
    segs.push({
      index: i,
      positionAlongAxis: (i + 0.5) * segLen,
      length: segLen,
      initialRadius: radius,
      radius,
      initialFuelMass: segMass,
      fuelMass: segMass,
      surfaceTemperature: T_AMBIENT,
      bulkTemperature: T_AMBIENT,
      charDepth: 0,
      state: "cold",
      HRR: 0,
      uvVRange: [i / segmentCount, (i + 1) / segmentCount],
      destroyed: false
    });
  }
  return segs;
}

export function rolloverSegments(segments: Segment[], surface: SurfaceField): void {
  for (const s of segments) {
    if (s.destroyed) continue;
    s.surfaceTemperature = averageInVRange(
      surface.temperature,
      surface.width,
      surface.height,
      s.uvVRange
    );
    const [vMin, vMax] = s.uvVRange;
    const rows = Math.max(1, Math.ceil((vMax - vMin) * surface.height));
    const totalTexels = rows * surface.width;
    const fuelSum = sumInVRange(
      surface.fuel,
      surface.width,
      surface.height,
      s.uvVRange
    );
    const fuelFrac = fuelSum / totalTexels;
    s.fuelMass = s.initialFuelMass * fuelFrac;
  }
}

export function charSegments(segments: Segment[], dt: number): void {
  for (const s of segments) {
    if (s.destroyed) continue;
    if (s.surfaceTemperature < 700) continue; // only char while surface is hot
    s.charDepth += BETA_CHAR * dt;
    s.radius = Math.max(0, s.initialRadius - s.charDepth);
    if (s.radius <= MIN_RADIUS) {
      s.destroyed = true;
    }
  }
}

export function updateSegmentStates(segments: Segment[]): void {
  for (const s of segments) {
    if (s.destroyed) {
      s.state = "ash";
      continue;
    }
    const fuelFrac = s.initialFuelMass > 0 ? s.fuelMass / s.initialFuelMass : 0;
    if (fuelFrac < FUEL_FRAC_ASH) {
      s.state = "ash";
    } else if (fuelFrac < FUEL_FRAC_EMBERING) {
      s.state = "embering";
    } else if (s.surfaceTemperature >= T_IGNITE) {
      s.state = "flaming";
    } else if (s.surfaceTemperature >= T_HEATING) {
      s.state = "heating";
    } else {
      s.state = "cold";
    }
  }
}

export function conductAxial(segments: Segment[], dt: number): void {
  if (segments.length < 2) return;

  const fluxes: number[] = new Array(segments.length).fill(0);

  for (let i = 0; i < segments.length - 1; i++) {
    const a = segments[i];
    const b = segments[i + 1];
    if (a.destroyed || b.destroyed) continue;
    const rMin = Math.min(a.radius, b.radius);
    const crossArea = Math.PI * rMin * rMin;
    const distance = (a.length + b.length) / 2;
    const Q =
      (K_WOOD * crossArea * (b.bulkTemperature - a.bulkTemperature)) / distance; // W

    const massA = RHO_WOOD * Math.PI * a.radius * a.radius * a.length;
    const massB = RHO_WOOD * Math.PI * b.radius * b.radius * b.length;
    const dTa = (Q * dt) / (massA * CP_WOOD);
    const dTb = (-Q * dt) / (massB * CP_WOOD);

    fluxes[i] += dTa;
    fluxes[i + 1] += dTb;
  }

  for (let i = 0; i < segments.length; i++) {
    if (segments[i].destroyed) continue;
    segments[i].bulkTemperature += fluxes[i];
  }
}

export interface CoupleSkinBulkOptions {
  dt: number;
  dxU: number; // m, texel circumferential pitch
  dxV: number; // m, texel longitudinal pitch
  skinThickness: number; // m, surface skin thickness used in combustion math
}

// Radial conduction between the surface skin (per-texel temperatures) and
// each segment's bulk reservoir. Energy-conserving: heat removed from the
// skin texels in a segment's V-band is exactly the heat added to that
// segment's bulkTemperature.
export function coupleSkinBulk(
  segments: Segment[],
  surface: import("./types").SurfaceField,
  opts: CoupleSkinBulkOptions
): void {
  const { dt, dxU, dxV, skinThickness } = opts;
  const texelArea = dxU * dxV;
  const texelMass = RHO_WOOD * texelArea * skinThickness;
  const skinHeatCap = texelMass * CP_WOOD; // J/K per texel

  for (const s of segments) {
    if (s.destroyed) continue;

    // Determine the row range this segment owns in the surface texture.
    const [vMin, vMax] = s.uvVRange;
    const rMin = Math.max(0, Math.floor(vMin * surface.height));
    const rMax = Math.min(surface.height, Math.ceil(vMax * surface.height));
    if (rMax <= rMin) continue;

    const bulkVolume = Math.PI * s.radius * s.radius * s.length;
    const bulkHeatCap = RHO_WOOD * bulkVolume * CP_WOOD;
    if (bulkHeatCap <= 0) continue;

    let energyToBulk = 0;
    const start = rMin * surface.width;
    const end = rMax * surface.width;
    for (let i = start; i < end; i++) {
      const Tskin = surface.temperature[i];
      // Heat flow into bulk per texel (W): H * texelArea * (Tskin - Tbulk)
      const Q = H_INTERNAL * texelArea * (Tskin - s.bulkTemperature);
      const dE = Q * dt; // J this tick
      // Apply to skin texel: reduce by energy / skinHeatCap.
      surface.temperature[i] = Tskin - dE / skinHeatCap;
      energyToBulk += dE;
    }
    s.bulkTemperature += energyToBulk / bulkHeatCap;
  }
}
