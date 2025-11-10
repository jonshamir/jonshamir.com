import { Matrix4, QuadraticBezierCurve3, Shape, Vector3 } from "three";
import { lerp } from "three/src/math/MathUtils.js";

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
  const segments = 8; // You can adjust this for the smoothness of the circle

  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta) * 0.1;
    const p = rotatePointToPlane(x, y, normal || new Vector3(0, 0, 1));
    points.push(center.x + p.x, center.y + p.y, center.z + p.z);
  }
  return points;
}

function connectLayers(l1: number[], l2: number[]) {
  const points: number[] = [];
  for (let i = 0; i < l1.length; i += 3) {
    points.push(l1[i], l1[i + 1], l1[i + 2]);
    points.push(l2[i + 3] || l2[0], l2[i + 4] || l2[1], l2[i + 5] || l2[2]);
    points.push(l2[i], l2[i + 1], l2[i + 2]);

    points.push(l1[i], l1[i + 1], l1[i + 2]);
    points.push(l1[i + 3] || l1[0], l1[i + 4] || l1[1], l1[i + 5] || l1[2]);
    points.push(l2[i + 3] || l2[0], l2[i + 4] || l2[1], l2[i + 5] || l2[2]);
  }
  return points;
}

// TODO send cross section shape
export function getLeafVertices(
  samples: number,
  curve: QuadraticBezierCurve3,
  age: number
) {
  let points: number[] = [];

  const n = samples;
  const radius = 0.12 * age;

  let prevLayer: number[] = [];
  for (let i = 0; i < n + 1; i++) {
    const t = i / n;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const r = lerp(radius, 0, Math.pow(t, 2));
    const layer = getLayerVertices(p, r, tangent);

    if (i > 0) points = points.concat(connectLayers(prevLayer, layer));
    prevLayer = layer;
  }
  return points;
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
