import * as THREE from "three";

export function bendAroundY(
  x: number,
  y: number,
  curveRadius: number
): [number, number, number] {
  if (curveRadius === 0) return [x, y, 0];
  const theta = x / curveRadius;
  return [
    curveRadius * Math.sin(theta),
    y,
    curveRadius * (1 - Math.cos(theta))
  ];
}

export function createCurvedPlaneGeometry(
  width: number,
  height: number,
  segments: number,
  curveRadius: number
) {
  const geometry = new THREE.PlaneGeometry(width, height, segments, 1);
  if (curveRadius === 0) return geometry;

  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const theta = x / curveRadius;
    const [px, py, pz] = bendAroundY(x, positions.getY(i), curveRadius);
    positions.setXYZ(i, px, py, pz);
    normals.setXYZ(i, -Math.sin(theta), 0, Math.cos(theta));
  }
  positions.needsUpdate = true;
  normals.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
