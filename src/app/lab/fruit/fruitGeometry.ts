import type { BufferGeometry } from "three/webgpu";
import { MathUtils, Vector3 } from "three/webgpu";

import { createFanCapGeometry } from "./fanCapGeometry";
import {
  createProfilePath,
  type FruitProfileParams,
  sampleProfile
} from "./fruitProfile";
import { createRevolvedGeometry } from "./revolvedGeometry";

export type FruitTopParams = {
  topSegments: number;
  // Apex to rim, so it is the cap's radius when the cap is flat.
  topRadius: number;
  // Degrees the wall is tilted up from flat.
  topAngle: number;
  // Slides apex and rim together along the axis.
  topOffset: number;
};

export type FruitGeometryParams = FruitProfileParams &
  FruitTopParams & {
    profileSegments: number;
    radialSegments: number;
  };

// One grid cell of the body mesh, which is what the vertex jitter measures its
// offsets in — expressing them in cells rather than world units is what keeps
// them below the fold-over threshold at any subdivision.
export type SurfaceMetrics = {
  cellAngle: number;
  cellLength: number;
};

export type SurfaceJitter = {
  jitterStrength: number;
  jitterScale: number;
  jitterSeed: number;
};

export type FruitGeometries = {
  body: BufferGeometry;
  top: BufferGeometry;
  metrics: SurfaceMetrics;
};

export function createFruitGeometries(
  params: FruitGeometryParams
): FruitGeometries {
  const path = createProfilePath(params);
  const profile = sampleProfile(path, params.profileSegments);

  const tip = profile[profile.length - 1];
  const { apex, ring } = createTopCap(tip.position.y, params);

  return {
    body: createRevolvedGeometry(profile, params.radialSegments),
    top: createFanCapGeometry(apex, ring),
    metrics: {
      cellAngle: (Math.PI * 2) / params.radialSegments,
      cellLength: path.getLength() / params.profileSegments
    }
  };
}

// The cap in polar form about the fruit's tip: every rim point is one radius
// out from the apex at the given tilt, so 0° lies it flat as a disc and 90°
// stands the wall straight up, collapsing the rim onto the axis.
//
// Nothing here reads the body. The cap is exactly what the three sliders say,
// which is what keeps each of them smooth and independent of the others.
function createTopCap(
  tipY: number,
  params: FruitTopParams
): { apex: Vector3; ring: Vector3[] } {
  const { topSegments, topRadius, topAngle, topOffset } = params;

  const tilt = MathUtils.degToRad(topAngle);
  const radius = topRadius * Math.cos(tilt);
  const apexY = tipY + topOffset;
  const y = apexY + topRadius * Math.sin(tilt);

  return {
    apex: new Vector3(0, apexY, 0),
    ring: Array.from({ length: topSegments }, (_, i) => {
      const theta = (i / topSegments) * Math.PI * 2;
      return new Vector3(radius * Math.cos(theta), y, radius * Math.sin(theta));
    })
  };
}
