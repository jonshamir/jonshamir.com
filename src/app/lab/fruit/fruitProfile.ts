import { CubicBezierCurve, CurvePath, Vector2 } from "three/webgpu";

export type FruitProfileParams = {
  height: number;
  radius: number;
  bulge: number;
  baseFlare: number;
  bottomTension: number;
  topTension: number;
  tipFlare: number;
};

export type ProfileSample = {
  position: Vector2;
  normal: Vector2;
  v: number;
};

// The silhouette of the fruit, in the (radius, height) half-plane, as two cubic
// segments meeting at the widest point.
//
// Both poles are approached horizontally and the widest point is approached and
// left vertically. That tangent arrangement is what lets the revolved surface
// close with a defined (0, ±1, 0) normal at the poles instead of pinching into a
// cone, and keeps the silhouette tangent-continuous across the seam.
export function createProfilePath(
  params: FruitProfileParams
): CurvePath<Vector2> {
  const {
    height,
    radius,
    bulge,
    baseFlare,
    bottomTension,
    topTension,
    tipFlare
  } = params;

  const bulgeY = bulge * height;

  const lower = new CubicBezierCurve(
    new Vector2(0, 0),
    new Vector2(baseFlare * radius, 0),
    new Vector2(radius, bulgeY - bottomTension * bulgeY),
    new Vector2(radius, bulgeY)
  );

  const upper = new CubicBezierCurve(
    new Vector2(radius, bulgeY),
    new Vector2(radius, bulgeY + topTension * (height - bulgeY)),
    new Vector2(tipFlare * radius, height),
    new Vector2(0, height)
  );

  const path = new CurvePath<Vector2>();
  path.add(lower);
  path.add(upper);

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
