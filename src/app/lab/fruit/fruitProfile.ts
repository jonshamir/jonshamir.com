import { CubicBezierCurve, CurvePath, Vector2 } from "three/webgpu";

// Normalized space: x in radius units, y in height units. Angles are degrees,
// measured along the direction of travel from base to tip.
export type ProfileAnchors = {
  baseY: number;
  baseHandle: number;
  baseAngle: number;
  midX: number;
  midY: number;
  midAngle: number;
  midIn: number;
  midOut: number;
  tipY: number;
  tipHandle: number;
  tipAngle: number;
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

function direction(angle: number): Vector2 {
  const radians = (angle * Math.PI) / 180;
  return new Vector2(Math.cos(radians), Math.sin(radians));
}

// The 7 control points of the two cubic segments, base to tip, with every x
// clamped to the axis so the curve can never cross it.
export function profileControlPoints(a: ProfileAnchors): Vector2[] {
  const base = new Vector2(0, a.baseY);
  const mid = new Vector2(a.midX, a.midY);
  const tip = new Vector2(0, a.tipY);
  const midDir = direction(a.midAngle);

  const points = [
    base,
    base.clone().addScaledVector(direction(a.baseAngle), a.baseHandle),
    mid.clone().addScaledVector(midDir, -a.midIn),
    mid,
    mid.clone().addScaledVector(midDir, a.midOut),
    tip.clone().addScaledVector(direction(a.tipAngle), -a.tipHandle),
    tip
  ];

  for (const point of points) point.x = Math.max(point.x, 0);
  return points;
}

// A pole approached horizontally closes smoothly with a (0, ±1, 0) normal;
// tilting its handle away from horizontal points it into a cone.
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
