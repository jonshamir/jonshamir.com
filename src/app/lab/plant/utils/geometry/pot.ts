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
  const bodyRings: { outerStart: number; innerStart: number }[] = [];

  for (let i = 0; i <= bodySegments; i++) {
    const t = i / bodySegments;
    const y = t * bodyHeight;
    const outerRadius = lerp(bottomRadius, topRadius, t);
    const innerRadius = outerRadius - potThickness;
    bodyRings.push(addRing(y, outerRadius, innerRadius, t * (bodyHeight / height)));
  }

  // Create transition layer (outer surface expanding to rim)
  // This connects the body to the rim with separate vertices
  const transitionRings: { outerStart: number; innerStart: number }[] = [];
  const transitionSegments = 2; // Number of segments in transition

  for (let i = 0; i <= transitionSegments; i++) {
    const t = i / transitionSegments;
    const y = bodyHeight;
    const outerRadius = lerp(topRadius, topRadius + rimThickness, t);
    const innerRadius = topRadius - potThickness;
    transitionRings.push(addRing(y, outerRadius, innerRadius, bodyHeight / height));
  }

  // Create rim (from top of body to top of pot)
  const rimSegments = segments - bodySegments;
  const rimRings: { outerStart: number; innerStart: number }[] = [];

  for (let i = 0; i <= rimSegments; i++) {
    const t = i / rimSegments;
    const y = bodyHeight + t * rimHeight;
    const outerRadius = topRadius + rimThickness;
    const innerRadius = topRadius - potThickness;
    const globalT = (bodyHeight + t * rimHeight) / height;
    rimRings.push(addRing(y, outerRadius, innerRadius, globalT));
  }

  // Build indices for body outer surface
  for (let i = 0; i < bodyRings.length - 1; i++) {
    const curr = bodyRings[i].outerStart;
    const next = bodyRings[i + 1].outerStart;

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

  // Build indices for transition outer surface
  for (let i = 0; i < transitionRings.length - 1; i++) {
    const curr = transitionRings[i].outerStart;
    const next = transitionRings[i + 1].outerStart;

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

  // Build indices for rim outer surface
  for (let i = 0; i < rimRings.length - 1; i++) {
    const curr = rimRings[i].outerStart;
    const next = rimRings[i + 1].outerStart;

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

  // Build indices for body inner surface
  for (let i = 0; i < bodyRings.length - 1; i++) {
    const curr = bodyRings[i].innerStart;
    const next = bodyRings[i + 1].innerStart;

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

  // Build indices for transition inner surface (connecting to rim)
  for (let i = 0; i < transitionRings.length - 1; i++) {
    const curr = transitionRings[i].innerStart;
    const next = transitionRings[i + 1].innerStart;

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

  // Build indices for rim inner surface
  for (let i = 0; i < rimRings.length - 1; i++) {
    const curr = rimRings[i].innerStart;
    const next = rimRings[i + 1].innerStart;

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

  // Add bottom face (solid disc at the bottom) with separate vertices for hard shading
  const bottomFaceStart = vertexIndex;

  // Create center vertex for bottom face
  allVertices.push(0, 0, 0);
  localZ.push(0);
  localX.push(0);
  localY.push(0);
  vertexIndex++;

  // Create separate ring of vertices for the bottom face (duplicating inner ring positions)
  const bottomInnerOriginal = bodyRings[0].innerStart;
  for (let j = 0; j < sides; j++) {
    const theta = (j / sides) * Math.PI * 2;
    const origIndex = bottomInnerOriginal + j;
    // Copy position from original inner ring
    const x = allVertices[origIndex * 3];
    const y = allVertices[origIndex * 3 + 1];
    const z = allVertices[origIndex * 3 + 2];

    allVertices.push(x, y, z);
    localZ.push(0);
    localX.push(Math.cos(theta));
    localY.push(Math.sin(theta));
    vertexIndex++;
  }

  // Build bottom face triangles
  for (let j = 0; j < sides; j++) {
    const i1 = bottomFaceStart + 1 + j;
    const i2 = bottomFaceStart + 1 + ((j + 1) % sides);

    // Bottom face triangles (pointing downward, so reversed winding)
    indices.push(bottomFaceStart, i2, i1);
  }

  // Add bottom wall (connecting outer and inner rings at bottom) with separate vertices
  const bottomWallOuterStart = vertexIndex;
  const bottomWallInnerStart = vertexIndex + sides;

  const bottomOuter = bodyRings[0].outerStart;

  // Create separate vertices for bottom wall outer ring
  for (let j = 0; j < sides; j++) {
    const theta = (j / sides) * Math.PI * 2;
    const origIndex = bottomOuter + j;
    const x = allVertices[origIndex * 3];
    const y = allVertices[origIndex * 3 + 1];
    const z = allVertices[origIndex * 3 + 2];

    allVertices.push(x, y, z);
    localZ.push(0);
    localX.push(Math.cos(theta));
    localY.push(Math.sin(theta));
    vertexIndex++;
  }

  // Create separate vertices for bottom wall inner ring
  for (let j = 0; j < sides; j++) {
    const theta = (j / sides) * Math.PI * 2;
    const origIndex = bottomInnerOriginal + j;
    const x = allVertices[origIndex * 3];
    const y = allVertices[origIndex * 3 + 1];
    const z = allVertices[origIndex * 3 + 2];

    allVertices.push(x, y, z);
    localZ.push(0);
    localX.push(Math.cos(theta));
    localY.push(Math.sin(theta));
    vertexIndex++;
  }

  // Build bottom wall triangles
  for (let j = 0; j < sides; j++) {
    const o1 = bottomWallOuterStart + j;
    const o2 = bottomWallOuterStart + ((j + 1) % sides);
    const i1 = bottomWallInnerStart + j;
    const i2 = bottomWallInnerStart + ((j + 1) % sides);

    // Bottom wall triangles (horizontal ring, viewed from outside)
    indices.push(o1, i2, i1);
    indices.push(o1, o2, i2);
  }

  // Add top rim face (horizontal surface at the top) with separate vertices for hard shading
  const topFaceStart = vertexIndex;

  // Create center vertex for top face
  allVertices.push(0, height, 0);
  localZ.push(1);
  localX.push(0);
  localY.push(0);
  vertexIndex++;

  // Create separate ring of vertices for the top face (duplicating inner ring positions)
  const topInnerOriginal = rimRings[rimRings.length - 1].innerStart;
  for (let j = 0; j < sides; j++) {
    const theta = (j / sides) * Math.PI * 2;
    const origIndex = topInnerOriginal + j;
    // Copy position from original inner ring
    const x = allVertices[origIndex * 3];
    const y = allVertices[origIndex * 3 + 1];
    const z = allVertices[origIndex * 3 + 2];

    allVertices.push(x, y, z);
    localZ.push(1);
    localX.push(Math.cos(theta));
    localY.push(Math.sin(theta));
    vertexIndex++;
  }

  // Build top face triangles
  for (let j = 0; j < sides; j++) {
    const i1 = topFaceStart + 1 + j;
    const i2 = topFaceStart + 1 + ((j + 1) % sides);

    // Top face triangles (pointing upward)
    indices.push(topFaceStart, i1, i2);
  }

  // Add top rim wall (connecting outer and inner rings at top) with separate vertices
  const topWallOuterStart = vertexIndex;
  const topWallInnerStart = vertexIndex + sides;

  const topOuter = rimRings[rimRings.length - 1].outerStart;

  // Create separate vertices for top wall outer ring
  for (let j = 0; j < sides; j++) {
    const theta = (j / sides) * Math.PI * 2;
    const origIndex = topOuter + j;
    const x = allVertices[origIndex * 3];
    const y = allVertices[origIndex * 3 + 1];
    const z = allVertices[origIndex * 3 + 2];

    allVertices.push(x, y, z);
    localZ.push(1);
    localX.push(Math.cos(theta));
    localY.push(Math.sin(theta));
    vertexIndex++;
  }

  // Create separate vertices for top wall inner ring
  for (let j = 0; j < sides; j++) {
    const theta = (j / sides) * Math.PI * 2;
    const origIndex = topInnerOriginal + j;
    const x = allVertices[origIndex * 3];
    const y = allVertices[origIndex * 3 + 1];
    const z = allVertices[origIndex * 3 + 2];

    allVertices.push(x, y, z);
    localZ.push(1);
    localX.push(Math.cos(theta));
    localY.push(Math.sin(theta));
    vertexIndex++;
  }

  // Build top wall triangles
  for (let j = 0; j < sides; j++) {
    const o1 = topWallOuterStart + j;
    const o2 = topWallOuterStart + ((j + 1) % sides);
    const i1 = topWallInnerStart + j;
    const i2 = topWallInnerStart + ((j + 1) % sides);

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
