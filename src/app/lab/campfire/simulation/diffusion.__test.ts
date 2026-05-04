import assert from "node:assert/strict";

import { T_AMBIENT } from "./constants";
import { diffuseSurface } from "./diffusion";
import { createSurfaceField } from "./surfaceField";

// 1. Uniform field at ambient stays at ambient.
{
  const f = createSurfaceField(8, 16);
  diffuseSurface(f, { dt: 1 / 30, dxU: 0.005, dxV: 0.005, lambdaLoss: 0.1 });
  for (const v of f.temperature) {
    assert.ok(Math.abs(v - T_AMBIENT) < 1e-3, `expected ambient, got ${v}`);
  }
}

// 2. Hot spike at center: peak drops, neighbors warm (no loss to isolate diffusion).
{
  const f = createSurfaceField(8, 16);
  const cx = 4;
  const cy = 8;
  f.temperature[cy * 8 + cx] = 1500;
  const peak0 = f.temperature[cy * 8 + cx];
  const neighbor0 = f.temperature[cy * 8 + (cx + 1)];
  diffuseSurface(f, { dt: 1 / 30, dxU: 0.005, dxV: 0.005, lambdaLoss: 0 });
  const peak1 = f.temperature[cy * 8 + cx];
  const neighbor1 = f.temperature[cy * 8 + (cx + 1)];
  assert.ok(peak1 < peak0, `peak should drop: ${peak0} -> ${peak1}`);
  assert.ok(neighbor1 > neighbor0, `neighbor should warm: ${neighbor0} -> ${neighbor1}`);
}

// 3. U axis wraps: hot column at u=0 warms u=width-1.
{
  const f = createSurfaceField(8, 4);
  for (let v = 0; v < 4; v++) f.temperature[v * 8 + 0] = 1500;
  diffuseSurface(f, { dt: 1 / 30, dxU: 0.005, dxV: 0.005, lambdaLoss: 0 });
  for (let v = 0; v < 4; v++) {
    assert.ok(
      f.temperature[v * 8 + 7] > T_AMBIENT,
      `wrap-around expected at v=${v}, got ${f.temperature[v * 8 + 7]}`
    );
  }
}

// 4. V axis clamps: hot row at v=0 does NOT warm v=height-1.
{
  const f = createSurfaceField(8, 8);
  for (let u = 0; u < 8; u++) f.temperature[0 * 8 + u] = 1500;
  diffuseSurface(f, { dt: 1 / 30, dxU: 0.005, dxV: 0.005, lambdaLoss: 0 });
  for (let u = 0; u < 8; u++) {
    assert.ok(
      Math.abs(f.temperature[7 * 8 + u] - T_AMBIENT) < 1e-3,
      `v should not wrap, got ${f.temperature[7 * 8 + u]}`
    );
  }
}

// 5. Convective loss alone (large dx => negligible diffusion) pulls hot toward ambient.
{
  const f = createSurfaceField(4, 4);
  f.temperature[0] = 1500;
  diffuseSurface(f, { dt: 1, dxU: 1, dxV: 1, lambdaLoss: 0.5 });
  assert.ok(f.temperature[0] < 1500 - 100, `loss should pull down: ${f.temperature[0]}`);
}

console.log("diffusion __test passed");
