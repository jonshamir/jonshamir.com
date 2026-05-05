import assert from "node:assert/strict";

import { T_AMBIENT } from "./constants";
import {
  averageInVRange,
  createSurfaceField,
  igniteBand,
  sumInVRange
} from "./surfaceField";

// createSurfaceField initialises temperature to ambient, fuel to 1, char to 0
{
  const f = createSurfaceField(8, 16);
  assert.equal(f.width, 8);
  assert.equal(f.height, 16);
  assert.equal(f.temperature.length, 8 * 16);
  for (const v of f.temperature) assert.equal(v, T_AMBIENT);
  for (const v of f.fuel) assert.equal(v, 1);
  for (const v of f.char) assert.equal(v, 0);
}

// igniteBand writes hot+partial-fuel into the V band of segment 0
{
  const f = createSurfaceField(8, 16);
  igniteBand(f, [0, 1 / 8], 1500, 0.5);
  // V band 0..1/8 spans rows 0..1 (height=16 -> 16/8 = 2 rows)
  for (let v = 0; v < 2; v++) {
    for (let u = 0; u < 8; u++) {
      const i = v * 8 + u;
      assert.equal(f.temperature[i], 1500);
      assert.equal(f.fuel[i], 0.5);
    }
  }
  // outside the band — untouched
  for (let v = 2; v < 16; v++) {
    const i = v * 8;
    assert.equal(f.temperature[i], T_AMBIENT);
    assert.equal(f.fuel[i], 1);
  }
}

// averageInVRange / sumInVRange respect the band
{
  const f = createSurfaceField(4, 8);
  // Make first 2 rows = 1000, rest = ambient
  for (let v = 0; v < 2; v++) {
    for (let u = 0; u < 4; u++) f.temperature[v * 4 + u] = 1000;
  }
  assert.equal(averageInVRange(f.temperature, f.width, f.height, [0, 0.25]), 1000);
  // Average across full log: (2*1000 + 6*ambient)/8
  const expected = (2 * 1000 + 6 * T_AMBIENT) / 8;
  const actual = averageInVRange(f.temperature, f.width, f.height, [0, 1]);
  assert.ok(Math.abs(actual - expected) < 1e-6);

  // Sum should equal width * (sum of values in rows)
  const s = sumInVRange(f.temperature, f.width, f.height, [0, 0.25]);
  assert.equal(s, 4 * 2 * 1000);
}

console.log("surfaceField __test passed");
