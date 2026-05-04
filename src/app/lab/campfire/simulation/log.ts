// src/app/lab/campfire/simulation/log.ts
import {
  ClampToEdgeWrapping,
  DataTexture,
  FloatType,
  LinearFilter,
  RedFormat,
  RepeatWrapping
} from "three";

import { combustStep } from "./combustion";
import { D_SURFACE, SIM_DT, T_FLAME_MAX } from "./constants";
import { diffuseSurface } from "./diffusion";
import {
  buildSegments,
  charSegments,
  conductAxial,
  rolloverSegments,
  updateSegmentStates
} from "./segments";
import { createSurfaceField, igniteBand } from "./surfaceField";
import type { LogModel, LogTextures, SurfaceField } from "./types";

export interface CreateLogOptions {
  length: number; // m
  radius: number; // m
  segmentCount: number;
  surfaceWidth: number;
  surfaceHeight: number;
}

const SKIN_THICKNESS = 0.001; // m, nominal heating layer for combustion math
const LAMBDA_LOSS = 0.1; // 1/s, surface convective loss coefficient

function makeFloatTexture(
  data: Float32Array,
  width: number,
  height: number
): DataTexture {
  const tex = new DataTexture(data, width, height, RedFormat, FloatType);
  // U axis (circumference) wraps; V axis (length) clamps.
  tex.wrapS = RepeatWrapping;
  tex.wrapT = ClampToEdgeWrapping;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

function buildTextures(field: SurfaceField): LogTextures {
  return {
    temperature: makeFloatTexture(field.temperature, field.width, field.height),
    char: makeFloatTexture(field.char, field.width, field.height),
    fuel: makeFloatTexture(field.fuel, field.width, field.height)
  };
}

export function createLog(opts: CreateLogOptions): LogModel {
  const surface = createSurfaceField(opts.surfaceWidth, opts.surfaceHeight);
  const textures = buildTextures(surface);
  const segments = buildSegments({
    length: opts.length,
    radius: opts.radius,
    segmentCount: opts.segmentCount
  });
  return {
    segments,
    totalLength: opts.length,
    surface,
    textures,
    simTime: 0
  };
}

export function igniteEnd(log: LogModel): void {
  const seg0 = log.segments[0];
  igniteBand(log.surface, seg0.uvVRange, T_FLAME_MAX, 0.5);
  log.textures.temperature.needsUpdate = true;
  log.textures.fuel.needsUpdate = true;
}

export function igniteAtSegment(log: LogModel, index: number): void {
  if (index < 0 || index >= log.segments.length) return;
  const seg = log.segments[index];
  igniteBand(log.surface, seg.uvVRange, T_FLAME_MAX, 0.5);
  log.textures.temperature.needsUpdate = true;
  log.textures.fuel.needsUpdate = true;
}

export function stepLog(log: LogModel, dt: number = SIM_DT): void {
  const sample = log.segments.find((s) => !s.destroyed) ?? log.segments[0];
  const dxU = (2 * Math.PI * sample.radius) / log.surface.width;
  const dxV = log.totalLength / log.surface.height;

  diffuseSurface(log.surface, {
    dt,
    dxU,
    dxV,
    lambdaLoss: LAMBDA_LOSS,
    diffusivity: D_SURFACE
  });
  combustStep(log.surface, { dt, dxU, dxV, skinThickness: SKIN_THICKNESS });
  rolloverSegments(log.segments, log.surface);
  charSegments(log.segments, dt);
  conductAxial(log.segments, dt);
  updateSegmentStates(log.segments);

  log.textures.temperature.needsUpdate = true;
  log.textures.char.needsUpdate = true;
  log.textures.fuel.needsUpdate = true;
  log.simTime += dt;
}
