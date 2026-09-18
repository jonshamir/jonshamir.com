import type { BufferGeometry, CurvePath, Vector2 } from "three/webgpu";
import { Vector3 } from "three/webgpu";

import { clamp } from "../../../lib/math";
import { createFanCapGeometry } from "./fanCapGeometry";
import {
  createProfilePath,
  type FruitProfileParams,
  sampleProfile,
  sampleProfileAt
} from "./fruitProfile";
import { createRevolvedGeometry } from "./revolvedGeometry";

export type FruitTopParams = {
  topSegments: number;
  topDrop: number;
  topSpread: number;
  topLift: number;
  topTwist: number;
};

export type FruitGeometryParams = FruitProfileParams &
  FruitTopParams & {
    profileSegments: number;
    radialSegments: number;
  };

export type FruitGeometries = {
  body: BufferGeometry;
  top: BufferGeometry;
};

export function createFruitGeometries(
  params: FruitGeometryParams
): FruitGeometries {
  const path = createProfilePath(params);
  const profile = sampleProfile(path, params.profileSegments);

  const tip = profile[profile.length - 1];
  const apex = new Vector3(0, tip.position.y, 0);

  return {
    body: createRevolvedGeometry(profile, params.radialSegments),
    top: createFanCapGeometry(apex, createTopRing(path, params))
  };
}

// The ring is read off the same profile curve as the body, which is what keeps
// the cap glued to the surface when the body's shape changes. topLift then
// pushes it along the body's own surface normal, so it peels away perpendicular
// to the skin rather than straight up.
function createTopRing(
  path: CurvePath<Vector2>,
  params: FruitTopParams
): Vector3[] {
  const { topSegments, topDrop, topSpread, topLift, topTwist } = params;

  const base = sampleProfileAt(path, clamp(1 - topDrop, 0, 1));
  const radius = base.position.x * topSpread + topLift * base.normal.x;
  const y = base.position.y + topLift * base.normal.y;

  return Array.from({ length: topSegments }, (_, i) => {
    const theta = ((i + topTwist) / topSegments) * Math.PI * 2;
    return new Vector3(radius * Math.cos(theta), y, radius * Math.sin(theta));
  });
}
