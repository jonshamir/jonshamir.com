// src/app/lab/campfire/rendering/useLogSimulation.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { SIM_DT } from "../simulation/constants";
import {
  createLog,
  igniteAtSegment as igniteAtSegmentImpl,
  igniteEnd as igniteEndImpl,
  stepLog
} from "../simulation/log";
import type { LogModel } from "../simulation/types";

export interface UseLogSimulationOptions {
  length: number;
  radius: number;
  segmentCount: number;
  surfaceWidth: number;
  surfaceHeight: number;
  paused?: boolean;
  timeScale?: number; // sim seconds per real second; default 1
}

export interface UseLogSimulationResult {
  log: LogModel;
  igniteEnd: () => void;
  igniteAtSegment: (index: number) => void;
  reset: () => void;
  // Increments every RAF tick — used to coerce React renders.
  tick: number;
}

// Cap is generous so high time-scale values can keep up at 60 fps without
// the accumulator drifting indefinitely. Each step is cheap (8k texels).
const MAX_STEPS_PER_FRAME = 240;

export function useLogSimulation(opts: UseLogSimulationOptions): UseLogSimulationResult {
  // Re-create the log when topology params change.
  const log = useMemo(
    () =>
      createLog({
        length: opts.length,
        radius: opts.radius,
        segmentCount: opts.segmentCount,
        surfaceWidth: opts.surfaceWidth,
        surfaceHeight: opts.surfaceHeight
      }),
    [opts.length, opts.radius, opts.segmentCount, opts.surfaceWidth, opts.surfaceHeight]
  );

  const [tick, setTick] = useState(0);
  const accRef = useRef(0);
  const lastRef = useRef(performance.now());
  const pausedRef = useRef(opts.paused ?? false);
  const timeScaleRef = useRef(opts.timeScale ?? 1);

  useEffect(() => {
    pausedRef.current = opts.paused ?? false;
  }, [opts.paused]);

  useEffect(() => {
    timeScaleRef.current = opts.timeScale ?? 1;
  }, [opts.timeScale]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const now = performance.now();
      const realDt = Math.min(0.1, (now - lastRef.current) / 1000);
      lastRef.current = now;
      if (!pausedRef.current) {
        accRef.current += realDt * timeScaleRef.current;
        let steps = 0;
        while (accRef.current >= SIM_DT && steps < MAX_STEPS_PER_FRAME) {
          stepLog(log, SIM_DT);
          accRef.current -= SIM_DT;
          steps++;
        }
        // If we hit the cap, drop remaining accumulated time to prevent
        // unbounded growth at high time-scales on slow frames.
        if (steps >= MAX_STEPS_PER_FRAME) accRef.current = 0;
        if (steps > 0) setTick((t) => t + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [log]);

  return {
    log,
    igniteEnd: () => igniteEndImpl(log),
    igniteAtSegment: (i: number) => igniteAtSegmentImpl(log, i),
    reset: () => {
      log.surface.temperature.fill(293);
      log.surface.fuel.fill(1);
      log.surface.char.fill(0);
      for (const s of log.segments) {
        s.radius = s.initialRadius;
        s.fuelMass = s.initialFuelMass;
        s.charDepth = 0;
        s.surfaceTemperature = 293;
        s.bulkTemperature = 293;
        s.state = "cold";
        s.destroyed = false;
        s.HRR = 0;
      }
      log.textures.temperature.needsUpdate = true;
      log.textures.fuel.needsUpdate = true;
      log.textures.char.needsUpdate = true;
      log.simTime = 0;
      setTick((t) => t + 1);
    },
    tick
  };
}
