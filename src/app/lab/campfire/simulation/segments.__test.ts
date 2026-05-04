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
  rolloverSegments,
  updateSegmentStates
} from "./segments";
import { createSurfaceField, igniteBand } from "./surfaceField";

// 1. buildSegments: N segments, contiguous V-ranges, correct positions.
{
  const segs = buildSegments({ length: 0.3, radius: 0.025, segmentCount: 6 });
  assert.equal(segs.length, 6);
  assert.ok(Math.abs(segs[0].positionAlongAxis - 0.025) < 1e-10);
  assert.ok(Math.abs(segs[5].positionAlongAxis - (0.3 - 0.025)) < 1e-10);
  assert.ok(Math.abs(segs[0].uvVRange[0] - 0) < 1e-10);
  assert.ok(Math.abs(segs[0].uvVRange[1] - (1 / 6)) < 1e-10);
  assert.ok(Math.abs(segs[5].uvVRange[0] - (5 / 6)) < 1e-10);
  assert.ok(Math.abs(segs[5].uvVRange[1] - 1) < 1e-10);
  for (const s of segs) {
    assert.equal(s.radius, 0.025);
    assert.equal(s.initialRadius, 0.025);
    assert.equal(s.temperature, T_AMBIENT);
    assert.equal(s.charDepth, 0);
    assert.equal(s.state, "cold");
    assert.equal(s.destroyed, false);
    assert.ok(s.fuelMass > 0);
    assert.equal(s.fuelMass, s.initialFuelMass);
  }
}

// 2. rolloverSegments: heat one band; segment 0 picks up the average.
{
  const segs = buildSegments({ length: 0.3, radius: 0.025, segmentCount: 6 });
  const f = createSurfaceField(16, 60);
  igniteBand(f, [0, 1 / 6], 1500, 0.5);
  rolloverSegments(segs, f);
  assert.ok(Math.abs(segs[0].temperature - 1500) < 1e-3);
  for (let k = 1; k < 6; k++) {
    assert.ok(Math.abs(segs[k].temperature - T_AMBIENT) < 1e-3);
  }
  assert.ok(Math.abs(segs[0].fuelMass - 0.5 * segs[0].initialFuelMass) < 1e-9);
}

// 3. charSegments: avg T above threshold => charDepth grows at BETA_CHAR.
{
  const segs = buildSegments({ length: 0.3, radius: 0.025, segmentCount: 6 });
  segs[0].temperature = 800;
  charSegments(segs, 1.0);
  assert.ok(Math.abs(segs[0].charDepth - BETA_CHAR) < 1e-12);
  assert.ok(Math.abs(segs[0].radius - (segs[0].initialRadius - BETA_CHAR)) < 1e-12);
  assert.equal(segs[1].charDepth, 0);
}

// 4. charSegments: shrink past MIN_RADIUS => destroyed.
{
  const segs = buildSegments({ length: 0.3, radius: 0.001, segmentCount: 3 });
  segs[1].temperature = 1000;
  charSegments(segs, 100);
  assert.equal(segs[1].destroyed, true);
  assert.ok(segs[1].radius <= MIN_RADIUS);
}

// 5. updateSegmentStates: thresholds map correctly.
{
  const segs = buildSegments({ length: 0.3, radius: 0.025, segmentCount: 5 });
  segs[0].temperature = T_AMBIENT + 1;
  segs[1].temperature = T_HEATING + 50;
  segs[2].temperature = T_IGNITE + 50;
  segs[3].temperature = T_IGNITE + 50;
  segs[3].fuelMass = segs[3].initialFuelMass * FUEL_FRAC_EMBERING * 0.5;
  segs[4].temperature = T_IGNITE + 50;
  segs[4].fuelMass = segs[4].initialFuelMass * FUEL_FRAC_ASH * 0.5;
  updateSegmentStates(segs);
  assert.equal(segs[0].state, "cold");
  assert.equal(segs[1].state, "heating");
  assert.equal(segs[2].state, "flaming");
  assert.equal(segs[3].state, "embering");
  assert.equal(segs[4].state, "ash");
}

// 6. conductAxial: hot segment warms cold neighbour; cold neighbour cools hot.
{
  const segs = buildSegments({ length: 0.3, radius: 0.025, segmentCount: 3 });
  segs[0].temperature = 1000;
  segs[1].temperature = T_AMBIENT;
  segs[2].temperature = T_AMBIENT;
  conductAxial(segs, 1.0);
  assert.ok(segs[1].temperature > T_AMBIENT, `n1 should warm: ${segs[1].temperature}`);
  assert.ok(segs[0].temperature < 1000, `n0 should cool: ${segs[0].temperature}`);
  // segment 2 is two hops away — only direct neighbours conduct in one pass:
  assert.ok(Math.abs(segs[2].temperature - T_AMBIENT) < 1e-6);
}

// 7. conductAxial: destroyed middle segment breaks the chain.
{
  const segs = buildSegments({ length: 0.3, radius: 0.025, segmentCount: 3 });
  segs[0].temperature = 1000;
  segs[1].destroyed = true;
  segs[2].temperature = T_AMBIENT;
  conductAxial(segs, 1.0);
  assert.equal(segs[2].temperature, T_AMBIENT, "no conduction across destroyed segment");
}

console.log("segments __test passed");
