import { CubicBezierCurve, CurvePath, Vector2 } from "three/webgpu";

// Normalized space: x in radius units, y in height units. Angles are degrees,
// measured along the direction of travel from base to tip.
export type ProfileAnchors = {
  baseY: number;
  baseHandle: number;
  lowerX: number;
  lowerY: number;
  lowerAngle: number;
  lowerIn: number;
  lowerOut: number;
  midX: number;
  midY: number;
  midAngle: number;
  midIn: number;
  midOut: number;
  upperX: number;
  upperY: number;
  upperAngle: number;
  upperIn: number;
  upperOut: number;
  tipY: number;
  tipHandle: number;
};

export type FruitProfileParams = ProfileAnchors & {
  height: number;
  radius: number;
};

export type ProfileSample = {
  position: Vector2;
  normal: Vector2;
  v: number;
};

export type InteriorAnchor = "lower" | "mid" | "upper";

function anchorDirection(angle: number): Vector2 {
  const radians = (angle * Math.PI) / 180;
  return new Vector2(Math.cos(radians), Math.sin(radians));
}

function interiorPoints(anchors: ProfileAnchors, key: InteriorAnchor) {
  const anchor = new Vector2(anchors[`${key}X`], anchors[`${key}Y`]);
  const dir = anchorDirection(anchors[`${key}Angle`]);
  return {
    in: anchor.clone().addScaledVector(dir, -anchors[`${key}In`]),
    anchor,
    out: anchor.clone().addScaledVector(dir, anchors[`${key}Out`])
  };
}

// The 13 control points of the four cubic segments, base to tip, with every x
// clamped to the axis so the curve can never cross it.
export function profileControlPoints(anchors: ProfileAnchors): Vector2[] {
  const lower = interiorPoints(anchors, "lower");
  const mid = interiorPoints(anchors, "mid");
  const upper = interiorPoints(anchors, "upper");

  const points = [
    new Vector2(0, anchors.baseY),
    new Vector2(anchors.baseHandle, anchors.baseY),
    lower.in,
    lower.anchor,
    lower.out,
    mid.in,
    mid.anchor,
    mid.out,
    upper.in,
    upper.anchor,
    upper.out,
    new Vector2(anchors.tipHandle, anchors.tipY),
    new Vector2(0, anchors.tipY)
  ];

  for (const point of points) point.x = Math.max(point.x, 0);
  return points;
}

// Both poles are approached horizontally, which is what lets the revolved
// surface close with a defined (0, ±1, 0) normal instead of pinching into a
// cone.
export function createProfilePath(
  params: FruitProfileParams
): CurvePath<Vector2> {
  const points = profileControlPoints(params).map(
    (p) => new Vector2(p.x * params.radius, p.y * params.height)
  );

  const path = new CurvePath<Vector2>();
  for (let i = 0; i < points.length - 1; i += 3) {
    path.add(
      new CubicBezierCurve(
        points[i],
        points[i + 1],
        points[i + 2],
        points[i + 3]
      )
    );
  }

  return path;
}

export function sampleProfileAt(
  path: CurvePath<Vector2>,
  u: number
): ProfileSample {
  const position = path.getPointAt(u);
  const tangent = path.getTangentAt(u);

  // The tangent rotated -90°, which points away from the axis for a profile
  // travelling base -> tip.
  const normal = new Vector2(tangent.y, -tangent.x).normalize();

  return { position, normal, v: u };
}

// Sampled by arc length rather than curve parameter, so segments stay evenly
// spaced instead of bunching where the curve flattens out.
export function sampleProfile(
  path: CurvePath<Vector2>,
  segments: number
): ProfileSample[] {
  return Array.from({ length: segments + 1 }, (_, i) =>
    sampleProfileAt(path, i / segments)
  );
}
