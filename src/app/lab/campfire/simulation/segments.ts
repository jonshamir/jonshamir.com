import {
  BETA_CHAR,
  FUEL_FRAC_ASH,
  FUEL_FRAC_EMBERING,
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
      temperature: T_AMBIENT,
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
    s.temperature = averageInVRange(
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
    if (s.temperature < 700) continue; // only char while surface is hot
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
    } else if (s.temperature >= T_IGNITE) {
      s.state = "flaming";
    } else if (s.temperature >= T_HEATING) {
      s.state = "heating";
    } else {
      s.state = "cold";
    }
  }
}
