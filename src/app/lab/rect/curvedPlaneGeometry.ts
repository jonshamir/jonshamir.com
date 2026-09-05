import * as THREE from "three";

// A surface that can be re-bent to a new radius after construction. Radius
// changes are geometry changes, so animating one means rewriting positions
// every frame — these handles do it in place, without allocating.
export type CurveHandle = { setCurveRadius(radius: number): void };

export function bendX(x: number, curveRadius: number) {
  return curveRadius === 0 ? x : curveRadius * Math.sin(x / curveRadius);
}

export function bendZ(x: number, curveRadius: number) {
  return curveRadius === 0 ? 0 : curveRadius * (1 - Math.cos(x / curveRadius));
}

// The unbent positions, kept on the geometry so the bend can be re-applied at
// any radius from the flat original rather than un-bending the current one.
type CurvedPlaneUserData = { flatPositions?: Float32Array };

export function createCurvedPlaneGeometry(
  width: number,
  height: number,
  segments: number,
  curveRadius: number
) {
  const geometry = new THREE.PlaneGeometry(width, height, segments, 1);
  const userData: CurvedPlaneUserData = geometry.userData;
  userData.flatPositions = Float32Array.from(
    geometry.attributes.position.array
  );
  setGeometryCurveRadius(geometry, curveRadius);
  return geometry;
}

// Re-bends a geometry from createCurvedPlaneGeometry to a new radius, in place
// and allocation-free, so the frame loop can drive it.
export function setGeometryCurveRadius(
  geometry: THREE.BufferGeometry,
  curveRadius: number
) {
  const flat = (geometry.userData as CurvedPlaneUserData).flatPositions;
  if (!flat) return;
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  for (let i = 0; i < positions.count; i++) {
    const x = flat[i * 3];
    const theta = curveRadius === 0 ? 0 : x / curveRadius;
    positions.setXYZ(
      i,
      bendX(x, curveRadius),
      flat[i * 3 + 1],
      bendZ(x, curveRadius)
    );
    normals.setXYZ(i, -Math.sin(theta), 0, Math.cos(theta));
  }
  positions.needsUpdate = true;
  normals.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
}
