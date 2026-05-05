import assert from "node:assert/strict";

import {
  BETA_CHAR,
  FUEL_FRAC_ASH,
  FUEL_FRAC_EMBERING,
  MIN_RADIUS,
  T_AMBIENT,
  T_HEATING,
  T_IGNITE
} from "./constants";
import {
  buildSegments,
  charSegments,
  conductAxial,
  coupleSkinBulk,
  rolloverSegments,
  updateSegmentStates
} from "./segments";
import { createSurfaceField, igniteBand } from "./surfaceField";

// 1. buildSegments: N segments, contiguous V-ranges, both temps at ambient.
{
  const segs = buildSegments({ length: 0.3, radius: 0.025, segmentCount: 6 });
  assert.equal(segs.length, 6);
  assert.ok(Math.abs(segs[0].positionAlongAxis - 0.025) < 1e-10);
  assert.ok(Math.abs(segs[5].positionAlongAxis - (0.3 - 0.025)) < 1e-10);
  assert.ok(Math.abs(segs[0].uvVRange[0] - 0) < 1e-10);
  assert.ok(Math.abs(segs[0].uvVRange[1] - 1 / 6) < 1e-10);
  assert.ok(Math.abs(segs[5].uvVRange[0] - 5 / 6) < 1e-10);
  assert.ok(Math.abs(segs[5].uvVRange[1] - 1) < 1e-10);
  for (const s of segs) {
    assert.equal(s.radius, 0.025);
    assert.equal(s.initialRadius, 0.025);
    assert.equal(s.surfaceTemperature, T_AMBIENT);
    assert.equal(s.bulkTemperature, T_AMBIENT);
    assert.equal(s.charDepth, 0);
    assert.equal(s.state, "cold");
    assert.equal(s.destroyed, false);
    assert.ok(s.fuelMass > 0);
    assert.equal(s.fuelMass, s.initialFuelMass);
  }
}

// 2. rolloverSegments writes surfaceTemperature only.
{
  const segs = buildSegments({ length: 0.3, radius: 0.025, segmentCount: 6 });
  const f = createSurfaceField(16, 60);
  igniteBand(f, [0, 1 / 6], 1500, 0.5);
  rolloverSegments(segs, f);
  assert.ok(Math.abs(segs[0].surfaceTemperature - 1500) < 1e-3);
  // bulkTemperature is untouched by rollover
  assert.equal(segs[0].bulkTemperature, T_AMBIENT);
  for (let k = 1; k < 6; k++) {
    assert.ok(Math.abs(segs[k].surfaceTemperature - T_AMBIENT) < 1e-3);
    assert.equal(segs[k].bulkTemperature, T_AMBIENT);
  }
  assert.ok(Math.abs(segs[0].fuelMass - 0.5 * segs[0].initialFuelMass) < 1e-9);
}

// 3. charSegments uses surfaceTemperature.
{
  const segs = buildSegments({ length: 0.3, radius: 0.025, segmentCount: 6 });
  segs[0].surfaceTemperature = 800;
  charSegments(segs, 1.0);
  assert.ok(Math.abs(segs[0].charDepth - BETA_CHAR) < 1e-12);
  assert.ok(
    Math.abs(segs[0].radius - (segs[0].initialRadius - BETA_CHAR)) < 1e-12
  );
  assert.equal(segs[1].charDepth, 0);
}

// 4. charSegments: shrink past MIN_RADIUS => destroyed.
{
  const segs = buildSegments({ length: 0.3, radius: 0.001, segmentCount: 3 });
  segs[1].surfaceTemperature = 1000;
  charSegments(segs, 100);
  assert.equal(segs[1].destroyed, true);
  assert.ok(segs[1].radius <= MIN_RADIUS);
}

// 5. updateSegmentStates uses surfaceTemperature.
{
  const segs = buildSegments({ length: 0.3, radius: 0.025, segmentCount: 5 });
  segs[0].surfaceTemperature = T_AMBIENT + 1;
  segs[1].surfaceTemperature = T_HEATING + 50;
  segs[2].surfaceTemperature = T_IGNITE + 50;
  segs[3].surfaceTemperature = T_IGNITE + 50;
  segs[3].fuelMass = segs[3].initialFuelMass * FUEL_FRAC_EMBERING * 0.5;
  segs[4].surfaceTemperature = T_IGNITE + 50;
  segs[4].fuelMass = segs[4].initialFuelMass * FUEL_FRAC_ASH * 0.5;
  updateSegmentStates(segs);
  assert.equal(segs[0].state, "cold");
  assert.equal(segs[1].state, "heating");
  assert.equal(segs[2].state, "flaming");
  assert.equal(segs[3].state, "embering");
  assert.equal(segs[4].state, "ash");
}

// 6. conductAxial operates on bulkTemperature, not surfaceTemperature.
{
  const segs = buildSegments({ length: 0.3, radius: 0.025, segmentCount: 3 });
  segs[0].bulkTemperature = 1000;
  segs[0].surfaceTemperature = 500; // distractor — should be untouched
  segs[1].bulkTemperature = T_AMBIENT;
  segs[2].bulkTemperature = T_AMBIENT;
  conductAxial(segs, 1.0);
  assert.ok(
    segs[1].bulkTemperature > T_AMBIENT,
    `bulk[1] should warm: ${segs[1].bulkTemperature}`
  );
  assert.ok(
    segs[0].bulkTemperature < 1000,
    `bulk[0] should cool: ${segs[0].bulkTemperature}`
  );
  // surfaceTemperature must not be touched by conductAxial
  assert.equal(segs[0].surfaceTemperature, 500);
  // Two hops away in one pass — unchanged
  assert.ok(Math.abs(segs[2].bulkTemperature - T_AMBIENT) < 1e-6);
}

// 7. conductAxial: destroyed middle segment breaks the chain.
{
  const segs = buildSegments({ length: 0.3, radius: 0.025, segmentCount: 3 });
  segs[0].bulkTemperature = 1000;
  segs[1].destroyed = true;
  segs[2].bulkTemperature = T_AMBIENT;
  conductAxial(segs, 1.0);
  assert.equal(segs[2].bulkTemperature, T_AMBIENT);
}

// 8. coupleSkinBulk: hot skin warms bulk; cold-relative-to-bulk skin gets warmed
//    by bulk; total energy is conserved between skin texels and the bulk.
{
  const segs = buildSegments({ length: 0.3, radius: 0.025, segmentCount: 1 });
  const f = createSurfaceField(16, 32);
  // Set entire surface band hot.
  igniteBand(f, segs[0].uvVRange, 1500, 1);

  // Compute initial total skin energy in the band.
  const dxU = (2 * Math.PI * segs[0].radius) / f.width;
  const dxV = 0.3 / f.height;
  const skinThickness = 0.001;
  const RHO_WOOD = 500;
  const CP_WOOD = 1700;
  const texelArea = dxU * dxV;
  const texelMass = RHO_WOOD * texelArea * skinThickness;
  const skinHeatCap = texelMass * CP_WOOD;
  const bulkVolume = Math.PI * segs[0].radius * segs[0].radius * segs[0].length;
  const bulkHeatCap = RHO_WOOD * bulkVolume * CP_WOOD;

  let skinE0 = 0;
  for (let i = 0; i < f.temperature.length; i++) {
    skinE0 += f.temperature[i] * skinHeatCap;
  }
  const bulkE0 = segs[0].bulkTemperature * bulkHeatCap;
  const totalE0 = skinE0 + bulkE0;

  coupleSkinBulk(segs, f, { dt: 0.01, dxU, dxV, skinThickness });

  // Skin cooled (surface temp dropped), bulk warmed.
  let skinE1 = 0;
  for (let i = 0; i < f.temperature.length; i++) {
    assert.ok(
      f.temperature[i] < 1500,
      `skin should cool: ${f.temperature[i]}`
    );
    skinE1 += f.temperature[i] * skinHeatCap;
  }
  assert.ok(
    segs[0].bulkTemperature > T_AMBIENT,
    `bulk should warm: ${segs[0].bulkTemperature}`
  );
  const bulkE1 = segs[0].bulkTemperature * bulkHeatCap;
  const totalE1 = skinE1 + bulkE1;

  // Energy conserved within numerical noise (relative).
  const relErr = Math.abs(totalE1 - totalE0) / totalE0;
  assert.ok(relErr < 1e-6, `energy not conserved: relErr=${relErr}`);
}

// 9. coupleSkinBulk: thinner segment's bulk equilibrates faster than fat
//    segment's, given the same hot surface. This is the SAV mechanism.
{
  const dt = 0.05;
  const skinThickness = 0.001;

  function bulkRiseFor(radius: number): number {
    const segs = buildSegments({ length: 0.3, radius, segmentCount: 1 });
    const f = createSurfaceField(32, 256);
    igniteBand(f, segs[0].uvVRange, 1500, 1);
    const dxU = (2 * Math.PI * radius) / f.width;
    const dxV = 0.3 / f.height;
    coupleSkinBulk(segs, f, { dt, dxU, dxV, skinThickness });
    return segs[0].bulkTemperature - T_AMBIENT;
  }

  const thinRise = bulkRiseFor(0.005);
  const fatRise = bulkRiseFor(0.05);
  // Thin bulk per unit length is r²·… — much smaller — so it warms a lot
  // more from the same skin energy in one tick.
  assert.ok(
    thinRise > fatRise * 5,
    `thin bulk should warm faster than fat: thin=${thinRise} fat=${fatRise}`
  );
}

console.log("segments __test passed");
