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
  assert.equal(log.textures.temperature.image.data, log.surface.temperature);
  assert.equal(log.textures.char.image.data, log.surface.char);
  assert.equal(log.textures.fuel.image.data, log.surface.fuel);
}

// 2 + 3. Apples-to-apples SAV: same length, same segment count, vary only radius.
//        With the two-layer thermal model the difference between thin and fat
//        must come from physics, not from differing test geometry.
{
  function runScenario(radius: number) {
    const log = createLog({
      length: 0.3,
      radius,
      segmentCount: 20,
      surfaceWidth: 32,
      surfaceHeight: 256
    });
    igniteEnd(log);
    for (let k = 0; k < 30 * 300; k++) stepLog(log);
    const destroyed = log.segments.filter((s) => s.destroyed).length;
    const farEnd = log.segments[log.segments.length - 1];
    return { destroyed, farEndT: farEnd.surfaceTemperature, farEndDestroyed: farEnd.destroyed };
  }

  const thin = runScenario(0.005); // 10 mm dia
  const fat = runScenario(0.05); // 100 mm dia

  // Thin: many segments destroyed (>= half the log).
  assert.ok(
    thin.destroyed >= 10,
    `thin should mostly burn through: destroyed=${thin.destroyed}`
  );
  // Fat: very little or no destruction.
  assert.ok(
    fat.destroyed <= 3,
    `fat should mostly stall: destroyed=${fat.destroyed}`
  );
  // Thin > fat by a wide margin.
  assert.ok(
    thin.destroyed > fat.destroyed + 5,
    `radius dependence too weak: thin=${thin.destroyed} fat=${fat.destroyed}`
  );
  // Fat log: far end stays cool.
  assert.ok(
    fat.farEndT < T_AMBIENT + 100,
    `fat log far end should stay near ambient: T=${fat.farEndT}`
  );
  assert.equal(fat.farEndDestroyed, false);
}

console.log("log __test passed");
