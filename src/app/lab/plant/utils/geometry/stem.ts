/**
 * Stem geometry generation
 */

import { QuadraticBezierCurve3 } from "three";
import { lerp } from "three/src/math/MathUtils.js";

import { getCircularLayerVertices } from "./shared";
import type { ColorTuple, PlantGeometryResult } from "./types";

/**
 * Generates cylindrical stem geometry along a curve with tapering
 * @param samples - Number of segments along the curve
 * @param curve - Quadratic Bezier curve defining the stem's path
 * @param age - Age multiplier affecting stem thickness (0 to 1)
 * @param baseRadius - Radius at the base of the stem
 * @param tipRadius - Radius at the tip of the stem
 * @param baseColor - RGB color for the base [r, g, b]
 * @param shadowColor - RGB color for shadows [r, g, b]
 * @param subsurfaceColor - RGB color for subsurface scattering [r, g, b]
 * @returns Object containing vertices, indices, local coordinates, and color attributes
 */
export function getStemVertices(
  samples: number,
  curve: QuadraticBezierCurve3,
  age: number,
  baseRadius: number = 0.05,
  tipRadius: number = 0.02,
  baseColor: ColorTuple = [0.2, 0.4, 0.24],
  shadowColor: ColorTuple = [0.06, 0.1, 0.15],
  subsurfaceColor: ColorTuple = [0.8, 1.0, 0.3]
): PlantGeometryResult {
  const n = samples;
  const segments = 12; // More segments for smoother cylinder

  // Build all vertices first (shared vertices for smooth shading)
  const allVertices: number[] = [];
  const localX: number[] = [];
  const localY: number[] = [];
  const localZ: number[] = [];
  const vertexBaseColors: number[] = [];
  const vertexShadowColors: number[] = [];
  const vertexSubsurfaceColors: number[] = [];

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

      // Color attributes (same for all vertices in stems)
      vertexBaseColors.push(baseColor[0], baseColor[1], baseColor[2]);
      vertexShadowColors.push(shadowColor[0], shadowColor[1], shadowColor[2]);
      vertexSubsurfaceColors.push(
        subsurfaceColor[0],
        subsurfaceColor[1],
        subsurfaceColor[2]
      );
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

  return {
    vertices: allVertices,
    indices,
    localX,
    localY,
    localZ,
    vertexBaseColors,
    vertexShadowColors,
    vertexSubsurfaceColors
  };
}
