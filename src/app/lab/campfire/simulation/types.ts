// src/app/lab/campfire/simulation/types.ts
import type { DataTexture } from "three";

export type SegmentState =
  | "cold"
  | "heating"
  | "flaming"
  | "embering"
  | "ash";

export interface Segment {
  index: number;
  positionAlongAxis: number; // m, center of segment along log axis (0 = origin)
  length: number; // m
  initialRadius: number; // m
  radius: number; // m, current
  initialFuelMass: number; // kg
  fuelMass: number; // kg
  surfaceTemperature: number; // K, average of surface texels in this segment's V-band
  bulkTemperature: number; // K, separate reservoir for the wood beneath the skin
  charDepth: number; // m
  state: SegmentState;
  HRR: number; // W
  uvVRange: [number, number];
  destroyed: boolean;
}

export interface SurfaceField {
  width: number; // U: circumference
  height: number; // V: along log length
  temperature: Float32Array; // length = width*height
  char: Float32Array;
  fuel: Float32Array;
}

export interface LogTextures {
  temperature: DataTexture;
  char: DataTexture;
  fuel: DataTexture;
}

export interface LogModel {
  segments: Segment[];
  totalLength: number; // m
  surface: SurfaceField;
  textures: LogTextures;
  // Cumulative simulated seconds for telemetry/debug
  simTime: number;
}
