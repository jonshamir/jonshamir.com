import { Matrix4, QuadraticBezierCurve3, Shape, Vector3 } from "three";
import { lerp } from "three/src/math/MathUtils.js";

const SEGMENTS = 8;

export const crossSectionShape = new Shape();
crossSectionShape.moveTo(0, -1 / 2);
crossSectionShape.lineTo(1 * 2, 0);
crossSectionShape.lineTo(0, -1);
crossSectionShape.lineTo(-1 * 2, 0);
crossSectionShape.lineTo(0, -1 / 2);

// Function to rotate a point on the XY plane to a point on the plane defined by a normal vector
function rotatePointToPlane(x: number, y: number, normal: Vector3): Vector3 {
  const axis = new Vector3().crossVectors(new Vector3(0, 0, 1), normal);
  const angle = Math.acos(new Vector3(0, 0, 1).dot(normal));
  const rotationMatrix = new Matrix4().makeRotationAxis(axis, angle);
  return new Vector3(x, y, 0).applyMatrix4(rotationMatrix);
}

// Gets vertices in a circle around a given center, rotated by the given normal vector
function getLayerVertices(center: Vector3, radius = 0.1, normal?: Vector3) {
  const points: number[] = [];
  const segments = SEGMENTS; // You can adjust this for the smoothness of the circle

  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta) * 0.1 - Math.abs(x) * 0.4;
    const p = rotatePointToPlane(x, y, normal || new Vector3(0, 0, 1));
    points.push(center.x + p.x, center.y + p.y, center.z + p.z);
  }

  return points;
}

// TODO send cross section shape
export function getLeafVertices(
  samples: number,
  curve: QuadraticBezierCurve3,
  age: number
) {
  const n = samples;
  const radius = 0.12 * age;
  const segments = SEGMENTS;

  // Build all vertices first (shared vertices for smooth shading)
  const allVertices: number[] = [];
  const localX: number[] = [];
  const localY: number[] = [];
  const localZ: number[] = [];

  for (let i = 0; i < n + 1; i++) {
    const t = i / n;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const r = lerp(radius, 0, Math.pow(t, 2));
    const layer = getLayerVertices(p, r, tangent);
    allVertices.push(...layer);

    // Calculate normalized local coordinates for each vertex in this layer
    for (let j = 0; j < segments; j++) {
      const theta = (j / segments) * Math.PI * 2;

      // localZ: 0 at base (i=0), 1 at tip (i=n)
      localZ.push(t);

      // localX: -1 to +1 based on cos(theta) (left to right around cross-section)
      localX.push(Math.cos(theta));

      // localY: -1 to +1 based on sin(theta) (bottom to top around cross-section)
      localY.push(Math.sin(theta));
    }
  }

  // Build indices to create triangles with shared vertices
  const indices: number[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < segments; j++) {
      const curr = i * segments + j;
      const next = i * segments + ((j + 1) % segments);
      const currNext = (i + 1) * segments + j;
      const nextNext = (i + 1) * segments + ((j + 1) % segments);

      // First triangle
      indices.push(curr, nextNext, currNext);
      // Second triangle
      indices.push(curr, next, nextNext);
    }
  }

  return { vertices: allVertices, indices, localX, localY, localZ };
}

// Gets vertices in a circle (for cylindrical stems) around a given center, rotated by the given normal vector
function getCircularLayerVertices(
  center: Vector3,
  radius = 0.1,
  normal?: Vector3,
  segments: number = 12
) {
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

export function getStemVertices(
  samples: number,
  curve: QuadraticBezierCurve3,
  age: number,
  baseRadius: number = 0.05,
  tipRadius: number = 0.02
) {
  const n = samples;
  const segments = 12; // More segments for smoother cylinder

  // Build all vertices first (shared vertices for smooth shading)
  const allVertices: number[] = [];
  const localX: number[] = [];
  const localY: number[] = [];
  const localZ: number[] = [];

  for (let i = 0; i < n + 1; i++) {
    const t = i / n;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const r = lerp(baseRadius, tipRadius, Math.pow(t, 1.5)) * age;
    const layer = getCircularLayerVertices(p, r, tangent, segments);
    allVertices.push(...layer);

    // Calculate normalized local coordinates for each vertex in this layer
    for (let j = 0; j < segments; j++) {
      const theta = (j / segments) * Math.PI * 2;

      // localZ: 0 at base (i=0), 1 at tip (i=n)
      localZ.push(t);

      // localX: -1 to +1 based on cos(theta) (left to right around cross-section)
      localX.push(Math.cos(theta));

      // localY: -1 to +1 based on sin(theta) (bottom to top around cross-section)
      localY.push(Math.sin(theta));
    }
  }

  // Build indices to create triangles with shared vertices
  const indices: number[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < segments; j++) {
      const curr = i * segments + j;
      const next = i * segments + ((j + 1) % segments);
      const currNext = (i + 1) * segments + j;
      const nextNext = (i + 1) * segments + ((j + 1) % segments);

      // First triangle
      indices.push(curr, nextNext, currNext);
      // Second triangle
      indices.push(curr, next, nextNext);
    }
  }

  return { vertices: allVertices, indices, localX, localY, localZ };
}

export const range = (
  start: number,
  end: number,
  step: number = 1
): number[] => {
  const output: number[] = [];
  if (typeof end === "undefined") {
    end = start;
    start = 0;
  }
  for (let i = start; i < end; i += step) {
    output.push(i);
  }
  return output;
};

export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

export function saturate(num: number): number {
  return clamp(num, 0, 1);
}

export function mapRange(
  value: number,
  low1: number,
  high1: number,
  low2: number,
  high2: number
): number {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

function xorHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash ^= char;
    hash *= 0x100000001b3; // A prime number multiplier for better distribution
  }
  // Normalize the hash to be between 0 and 1
  return (hash % 1000000) / 1000000; // Adjust the modulo to desired precision
}

export function pseudoRandom(n: number): number {
  // Convert the number to a string for hashing
  const str = n.toString();
  // Get the hash value using xorHash
  return xorHash(str) * 2 - 1;
}
