/**
 * Flower geometry generation
 */

import { lerp } from "three/src/math/MathUtils.js";

import type { ColorTuple, PlantGeometryResult } from "./types";

/**
 * Creates a 6-sided cylindrical flower geometry with petals
 * @param height - Height of the cylinder
 * @param baseRadius - Radius at the base
 * @param tipRadius - Radius at the tip
 * @param segments - Number of height segments (default: 2)
 * @param baseColor - RGB color for the base (default: pink)
 * @param shadowColor - RGB color for shadows (default: dark pink)
 * @param subsurfaceColor - RGB color for subsurface scattering (default: light pink)
 * @returns Object containing vertices, indices, and local coordinates
 */
export function getFlowerVertices(
  height: number = 0.15,
  baseRadius: number = 0.005,
  tipRadius: number = 0.002,
  segments: number = 2,
  baseColor: ColorTuple = [1.0, 0.41, 0.71],
  shadowColor: ColorTuple = [0.5, 0.1, 0.3],
  subsurfaceColor: ColorTuple = [1.0, 0.7, 0.9]
): PlantGeometryResult {
  const sides = 6; // 6-sided cylinder
  const n = segments + 1; // Number of layers

  const allVertices: number[] = [];
  const localX: number[] = [];
  const localY: number[] = [];
  const localZ: number[] = [];
  const vertexBaseColors: number[] = [];
  const vertexShadowColors: number[] = [];
  const vertexSubsurfaceColors: number[] = [];

  // Create vertices layer by layer along the height
  for (let i = 0; i < n; i++) {
    const t = i / segments;
    const y = t * height;
    const radius = lerp(baseRadius, tipRadius, t);

    // Create a circular layer of vertices
    for (let j = 0; j < sides; j++) {
      const theta = (j / sides) * Math.PI * 2;
      const x = radius * Math.cos(theta);
      const z = radius * Math.sin(theta);

      allVertices.push(x, y, z);

      // Local coordinates for shader
      localZ.push(t); // 0 at base, 1 at tip
      localX.push(Math.cos(theta)); // -1 to +1 around cylinder
      localY.push(Math.sin(theta)); // -1 to +1 around cylinder

      // Color attributes (same for all vertices in flowers)
      vertexBaseColors.push(baseColor[0], baseColor[1], baseColor[2]);
      vertexShadowColors.push(shadowColor[0], shadowColor[1], shadowColor[2]);
      vertexSubsurfaceColors.push(
        subsurfaceColor[0],
        subsurfaceColor[1],
        subsurfaceColor[2]
      );
    }
  }

  // Build indices to create triangles
  const indices: number[] = [];

  // Cylinder body triangles
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < sides; j++) {
      const curr = i * sides + j;
      const next = i * sides + ((j + 1) % sides);
      const currNext = (i + 1) * sides + j;
      const nextNext = (i + 1) * sides + ((j + 1) % sides);

      // First triangle (counter-clockwise winding)
      indices.push(curr, currNext, nextNext);
      // Second triangle (counter-clockwise winding)
      indices.push(curr, nextNext, next);
    }
  }

  // Add petal vertices as separate geometry for flat shading
  // Each petal gets its own 3 vertices (not shared with cylinder)
  const petalLength = tipRadius * 3; // How far petals extend from cylinder
  const tipY = height;

  for (let j = 0; j < sides; j++) {
    // Get the positions of the two edge vertices from the cylinder
    const theta1 = (j / sides) * Math.PI * 2;
    const theta2 = ((j + 1) / sides) * Math.PI * 2;
    const thetaMid = (theta1 + theta2) / 2;

    const edgeRadius = lerp(baseRadius, tipRadius, 1.0);
    const edge1X = edgeRadius * Math.cos(theta1);
    const edge1Z = edgeRadius * Math.sin(theta1);
    const edge2X = edgeRadius * Math.cos(theta2);
    const edge2Z = edgeRadius * Math.sin(theta2);

    const petalTipX = petalLength * Math.cos(thetaMid);
    const petalTipZ = petalLength * Math.sin(thetaMid);

    // Add 3 separate vertices for this petal triangle
    // Vertex 1: First edge
    allVertices.push(edge1X, tipY, edge1Z);
    localZ.push(1.0);
    localX.push(Math.cos(theta1));
    localY.push(Math.sin(theta1));
    vertexBaseColors.push(baseColor[0], baseColor[1], baseColor[2]);
    vertexShadowColors.push(shadowColor[0], shadowColor[1], shadowColor[2]);
    vertexSubsurfaceColors.push(
      subsurfaceColor[0],
      subsurfaceColor[1],
      subsurfaceColor[2]
    );

    // Vertex 2: Second edge
    allVertices.push(edge2X, tipY, edge2Z);
    localZ.push(1.0);
    localX.push(Math.cos(theta2));
    localY.push(Math.sin(theta2));
    vertexBaseColors.push(baseColor[0], baseColor[1], baseColor[2]);
    vertexShadowColors.push(shadowColor[0], shadowColor[1], shadowColor[2]);
    vertexSubsurfaceColors.push(
      subsurfaceColor[0],
      subsurfaceColor[1],
      subsurfaceColor[2]
    );

    // Vertex 3: Petal tip
    allVertices.push(petalTipX, tipY, petalTipZ);
    localZ.push(1.0);
    localX.push(Math.cos(thetaMid));
    localY.push(Math.sin(thetaMid));
    vertexBaseColors.push(baseColor[0], baseColor[1], baseColor[2]);
    vertexShadowColors.push(shadowColor[0], shadowColor[1], shadowColor[2]);
    vertexSubsurfaceColors.push(
      subsurfaceColor[0],
      subsurfaceColor[1],
      subsurfaceColor[2]
    );

    // Add triangle indices for this petal (counter-clockwise winding)
    const petalVertexStart = n * sides + j * 3;
    indices.push(petalVertexStart, petalVertexStart + 2, petalVertexStart + 1);
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
