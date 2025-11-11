/**
 * Pot geometry generation
 */

import { lerp } from "three/src/math/MathUtils.js";

import type { PotGeometryResult } from "./types";

/**
 * Creates a pot geometry with variable thickness walls and rim
 * @param height - Height of the pot
 * @param bottomRadius - Radius at the bottom
 * @param topRadius - Radius at the top (wider for typical pot shape)
 * @param rimHeight - Height of the rim at the top
 * @param rimThickness - Thickness of the rim
 * @param potThickness - Wall thickness of the pot
 * @param segments - Number of height segments (default: 10)
 * @returns Object containing vertices, indices, and local coordinates
 */
export function getPotVertices(
  height: number = 1.0,
  bottomRadius: number = 0.3,
  topRadius: number = 0.5,
  rimHeight: number = 0.1,
  rimThickness: number = 0.05,
  potThickness: number = 0.03,
  segments: number = 10
): PotGeometryResult {
  const sides = 24; // More segments for smoother pot
  const bodyHeight = height - rimHeight;

  const allVertices: number[] = [];
  const localX: number[] = [];
  const localY: number[] = [];
  const localZ: number[] = [];
  const indices: number[] = [];

  let vertexIndex = 0;

  // Helper to add a ring of vertices
  const addRing = (
    y: number,
    outerRadius: number,
    innerRadius: number,
    t: number
  ) => {
    const outerStart = vertexIndex;

    // Outer ring
    for (let j = 0; j < sides; j++) {
      const theta = (j / sides) * Math.PI * 2;
      const x = outerRadius * Math.cos(theta);
      const z = outerRadius * Math.sin(theta);

      allVertices.push(x, y, z);
      localZ.push(t);
      localX.push(Math.cos(theta));
      localY.push(Math.sin(theta));
      vertexIndex++;
    }

    const innerStart = vertexIndex;

    // Inner ring
    for (let j = 0; j < sides; j++) {
      const theta = (j / sides) * Math.PI * 2;
      const x = innerRadius * Math.cos(theta);
      const z = innerRadius * Math.sin(theta);

      allVertices.push(x, y, z);
      localZ.push(t);
      localX.push(Math.cos(theta));
      localY.push(Math.sin(theta));
      vertexIndex++;
    }

    return { outerStart, innerStart };
  };

  // Create pot body (from bottom to where rim starts)
  const bodySegments = Math.floor(segments * (bodyHeight / height));
  const rings: { outerStart: number; innerStart: number }[] = [];

  for (let i = 0; i <= bodySegments; i++) {
    const t = i / bodySegments;
    const y = t * bodyHeight;
    const outerRadius = lerp(bottomRadius, topRadius, t);
    const innerRadius = outerRadius - potThickness;
    rings.push(addRing(y, outerRadius, innerRadius, t * (bodyHeight / height)));
  }

  // Create rim (from top of body to top of pot)
  const rimSegments = segments - bodySegments;

  for (let i = 1; i <= rimSegments; i++) {
    const t = i / rimSegments;
    const y = bodyHeight + t * rimHeight;
    const outerRadius = topRadius + rimThickness;
    const innerRadius = topRadius - potThickness;
    const globalT = (bodyHeight + t * rimHeight) / height;
    rings.push(addRing(y, outerRadius, innerRadius, globalT));
  }

  // Build indices for outer surface
  for (let i = 0; i < rings.length - 1; i++) {
    const curr = rings[i].outerStart;
    const next = rings[i + 1].outerStart;

    for (let j = 0; j < sides; j++) {
      const c1 = curr + j;
      const c2 = curr + ((j + 1) % sides);
      const n1 = next + j;
      const n2 = next + ((j + 1) % sides);

      // Outer surface triangles
      indices.push(c1, n1, n2);
      indices.push(c1, n2, c2);
    }
  }

  // Build indices for inner surface
  for (let i = 0; i < rings.length - 1; i++) {
    const curr = rings[i].innerStart;
    const next = rings[i + 1].innerStart;

    for (let j = 0; j < sides; j++) {
      const c1 = curr + j;
      const c2 = curr + ((j + 1) % sides);
      const n1 = next + j;
      const n2 = next + ((j + 1) % sides);

      // Inner surface triangles (reversed winding)
      indices.push(c1, n2, n1);
      indices.push(c1, c2, n2);
    }
  }

  // Add bottom face (solid disc at the bottom)
  const bottomCenterIndex = vertexIndex;
  allVertices.push(0, 0, 0); // Center vertex at bottom
  localZ.push(0);
  localX.push(0);
  localY.push(0);
  vertexIndex++;

  const bottomInner = rings[0].innerStart;
  for (let j = 0; j < sides; j++) {
    const i1 = bottomInner + j;
    const i2 = bottomInner + ((j + 1) % sides);

    // Bottom face triangles (pointing downward, so reversed winding)
    indices.push(bottomCenterIndex, i2, i1);
  }

  // Add bottom wall (connecting outer and inner rings at bottom)
  const bottomOuter = rings[0].outerStart;

  for (let j = 0; j < sides; j++) {
    const o1 = bottomOuter + j;
    const o2 = bottomOuter + ((j + 1) % sides);
    const i1 = bottomInner + j;
    const i2 = bottomInner + ((j + 1) % sides);

    // Bottom wall triangles (horizontal ring, viewed from outside)
    indices.push(o1, i2, i1);
    indices.push(o1, o2, i2);
  }

  // Add top rim face (horizontal surface at the top)
  const topCenterIndex = vertexIndex;
  allVertices.push(0, height, 0); // Center vertex at top
  localZ.push(1);
  localX.push(0);
  localY.push(0);
  vertexIndex++;

  const topInner = rings[rings.length - 1].innerStart;
  for (let j = 0; j < sides; j++) {
    const i1 = topInner + j;
    const i2 = topInner + ((j + 1) % sides);

    // Top face triangles (pointing upward)
    indices.push(topCenterIndex, i1, i2);
  }

  // Add top rim wall (connecting outer and inner rings at top)
  const topOuter = rings[rings.length - 1].outerStart;

  for (let j = 0; j < sides; j++) {
    const o1 = topOuter + j;
    const o2 = topOuter + ((j + 1) % sides);
    const i1 = topInner + j;
    const i2 = topInner + ((j + 1) % sides);

    // Top rim wall triangles (horizontal ring, viewed from outside)
    indices.push(o1, i1, i2);
    indices.push(o1, i2, o2);
  }

  return {
    vertices: allVertices,
    indices,
    localX,
    localY,
    localZ
  };
}
