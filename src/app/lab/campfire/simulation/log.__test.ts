// src/app/lab/campfire/simulation/log.__test.ts
import assert from "node:assert/strict";

import { T_AMBIENT } from "./constants";
import { createLog, igniteEnd, stepLog } from "./log";

// 1. createLog: shape and initial state.
{
  const log = createLog({
    length: 0.3,
    radius: 0.025,
    segmentCount: 6,
    surfaceWidth: 16,
    surfaceHeight: 60
  });
  assert.equal(log.segments.length, 6);
  assert.equal(log.surface.width, 16);
  assert.equal(log.surface.height, 60);
  assert.equal(log.simTime, 0);
  // textures wrap the same buffers
  assert.equal(log.textures.temperature.image.data, log.surface.temperature);
  assert.equal(log.textures.char.image.data, log.surface.char);
  assert.equal(log.textures.fuel.image.data, log.surface.fuel);
}

// 2. SAV scenario — thin twig: lit at one end, burns through.
{
  const log = createLog({
    length: 0.15,
    radius: 0.0025, // 5 mm dia thin twig
    segmentCount: 12,
    surfaceWidth: 32,
    surfaceHeight: 240
  });
  igniteEnd(log);
  // Run ~5 simulated minutes at 30 Hz
  for (let k = 0; k < 30 * 300; k++) stepLog(log);
  const remaining = log.segments.filter((s) => !s.destroyed).length;
  assert.ok(
    remaining < log.segments.length / 2,
    `thin twig should mostly burn: remaining=${remaining}`
  );
}

// 3. SAV scenario — fat log: lit at one end, far end stays cold.
{
  const log = createLog({
    length: 0.3,
    radius: 0.025, // 50 mm dia
    segmentCount: 20,
    surfaceWidth: 32,
    surfaceHeight: 320
  });
  igniteEnd(log);
  for (let k = 0; k < 30 * 300; k++) stepLog(log);
  const farEnd = log.segments[log.segments.length - 1];
  assert.ok(
    farEnd.temperature < T_AMBIENT + 100,
    `fat log far end should stay near ambient: T=${farEnd.temperature}`
  );
  assert.equal(farEnd.destroyed, false);
}

console.log("log __test passed");
