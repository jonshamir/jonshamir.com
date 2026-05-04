// src/app/lab/campfire/simulation/combustion.__test.ts
import assert from "node:assert/strict";

import { T_AMBIENT, T_FLAME_MAX, T_IGNITE } from "./constants";
import { combustStep } from "./combustion";
import { createSurfaceField } from "./surfaceField";

// 1. Texel below ignition: nothing changes.
{
  const f = createSurfaceField(4, 4);
  f.temperature[0] = T_IGNITE - 50;
  combustStep(f, { dt: 1 / 30, dxU: 0.005, dxV: 0.005, skinThickness: 0.001 });
  assert.equal(f.fuel[0], 1);
  assert.equal(f.char[0], 0);
  assert.equal(f.temperature[0], T_IGNITE - 50);
}

// 2. Hot texel with fuel: fuel decreases, char increases, T rises (or capped).
{
  const f = createSurfaceField(4, 4);
  f.temperature[0] = T_IGNITE + 100;
  const T0 = f.temperature[0];
  combustStep(f, { dt: 1 / 30, dxU: 0.005, dxV: 0.005, skinThickness: 0.001 });
  assert.ok(f.fuel[0] < 1, `fuel should decrease: ${f.fuel[0]}`);
  assert.ok(f.char[0] > 0, `char should grow: ${f.char[0]}`);
  assert.ok(
    f.temperature[0] >= T0 || f.temperature[0] === T_FLAME_MAX,
    `T should rise or be capped: ${T0} -> ${f.temperature[0]}`
  );
  assert.ok(f.temperature[0] <= T_FLAME_MAX);
}

// 3. Hot texel with no fuel: nothing burns; T unaffected by combustion.
{
  const f = createSurfaceField(4, 4);
  f.temperature[0] = T_IGNITE + 200;
  f.fuel[0] = 0;
  const T0 = f.temperature[0];
  combustStep(f, { dt: 1 / 30, dxU: 0.005, dxV: 0.005, skinThickness: 0.001 });
  assert.equal(f.fuel[0], 0);
  assert.equal(f.char[0], 0);
  assert.equal(f.temperature[0], T0);
}

// 4. Char clamps to 1, fuel clamps to 0.
{
  const f = createSurfaceField(4, 4);
  f.temperature[0] = T_FLAME_MAX;
  f.fuel[0] = 0.001;
  for (let k = 0; k < 1000; k++) {
    combustStep(f, { dt: 1 / 30, dxU: 0.005, dxV: 0.005, skinThickness: 0.001 });
  }
  assert.equal(f.fuel[0], 0);
  assert.ok(f.char[0] >= 0 && f.char[0] <= 1, `char in [0,1]: ${f.char[0]}`);
}

// 5. Cool texel with fuel ignored entirely.
{
  const f = createSurfaceField(4, 4);
  combustStep(f, { dt: 1 / 30, dxU: 0.005, dxV: 0.005, skinThickness: 0.001 });
  for (let i = 0; i < f.temperature.length; i++) {
    assert.equal(f.temperature[i], T_AMBIENT);
    assert.equal(f.fuel[i], 1);
    assert.equal(f.char[i], 0);
  }
}

console.log("combustion __test passed");
