/**
 * Shared geometry utilities for plant generation
 */

import { Matrix4, Shape, Vector3 } from "three";

/**
 * Number of segments for leaf cross-sections
 */
export const SEGMENTS = 12;

/**
 * Cross-section shape for leaves (diamond/leaf shape)
 * Currently unused but kept for potential future use
 */
export const crossSectionShape = new Shape();
crossSectionShape.moveTo(0, -1 / 2);
crossSectionShape.lineTo(1 * 2, 0);
crossSectionShape.lineTo(0, -1);
crossSectionShape.lineTo(-1 * 2, 0);
crossSectionShape.lineTo(0, -1 / 2);

/**
 * Rotates a point on the XY plane to a point on a plane defined by a normal vector
 * @param x - X coordinate on XY plane
 * @param y - Y coordinate on XY plane
 * @param normal - Normal vector defining the target plane
 * @returns Rotated point as Vector3
 */
export function rotatePointToPlane(
  x: number,
  y: number,
  normal: Vector3
): Vector3 {
  const axis = new Vector3().crossVectors(new Vector3(0, 0, 1), normal);
  const angle = Math.acos(new Vector3(0, 0, 1).dot(normal));
  const rotationMatrix = new Matrix4().makeRotationAxis(axis, angle);
  return new Vector3(x, y, 0).applyMatrix4(rotationMatrix);
}

/**
 * Gets vertices in a flattened leaf shape around a given center
 * Creates a diamond-like cross-section that's wider horizontally
 * @param center - Center point for the layer
 * @param radius - Base radius of the layer
 * @param normal - Normal vector for rotation (optional)
 * @returns Flat array of vertex positions [x, y, z, ...]
 */
export function getLayerVertices(
  center: Vector3,
  radius = 0.1,
  normal?: Vector3
): number[] {
  const points: number[] = [];
  const segments = SEGMENTS;

  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta) * 0.1 - Math.abs(x) * 0.4;
    const p = rotatePointToPlane(x, y, normal || new Vector3(0, 0, 1));
    points.push(center.x + p.x, center.y + p.y, center.z + p.z);
  }

  return points;
}

/**
 * Gets vertices in a perfect circle (for cylindrical stems/flowers)
 * @param center - Center point for the layer
 * @param radius - Radius of the circle
 * @param normal - Normal vector for rotation (optional)
 * @param segments - Number of segments around the circle (default: 12)
 * @returns Flat array of vertex positions [x, y, z, ...]
 */
export function getCircularLayerVertices(
  center: Vector3,
  radius = 0.1,
  normal?: Vector3,
  segments: number = 12
): number[] {
  const points: number[] = [];

  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);
    const p = rotatePointToPlane(x, y, normal || new Vector3(0, 0, 1));
    points.push(center.x + p.x, center.y + p.y, center.z + p.z);
  }

  return points;
}
