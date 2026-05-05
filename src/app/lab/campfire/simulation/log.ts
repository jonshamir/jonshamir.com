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
  coupleSkinBulk,
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
// Newtonian cooling rate of the skin to ambient air. Derived from
// H_CONV / (RHO_WOOD * skinThickness * CP_WOOD) ≈ 15/(500·0.001·1700) ≈ 0.018.
// (Was 0.1 before bulk coupling existed — that value implicitly included
// the bulk-drain term, which is now modeled explicitly.)
const LAMBDA_LOSS = 0.02; // 1/s

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
  // Skin <-> bulk radial conduction is the mechanism that gives thin sticks
  // a sustained surface flame and fat logs a stalled one. Run after the
  // combustion energy has been deposited into the skin, before rollup.
  coupleSkinBulk(log.segments, log.surface, {
    dt,
    dxU,
    dxV,
    skinThickness: SKIN_THICKNESS
  });
  rolloverSegments(log.segments, log.surface);

  // Snapshot destroyed-state before charSegments mutates it, so we can detect
  // segments that just burned through this tick and ignite their neighbours.
  // Models the exposed-end-grain feedback: a destroyed segment leaves fresh
  // wood face on its neighbour, which radiantly re-ignites.
  const wasDestroyed = log.segments.map((s) => s.destroyed);
  charSegments(log.segments, dt);
  for (let i = 0; i < log.segments.length; i++) {
    if (log.segments[i].destroyed && !wasDestroyed[i]) {
      const left = log.segments[i - 1];
      const right = log.segments[i + 1];
      if (left && !left.destroyed) {
        igniteBand(log.surface, left.uvVRange, T_FLAME_MAX, 0.5);
      }
      if (right && !right.destroyed) {
        igniteBand(log.surface, right.uvVRange, T_FLAME_MAX, 0.5);
      }
    }
  }

  conductAxial(log.segments, dt);
  updateSegmentStates(log.segments);

  log.textures.temperature.needsUpdate = true;
  log.textures.char.needsUpdate = true;
  log.textures.fuel.needsUpdate = true;
  log.simTime += dt;
}
