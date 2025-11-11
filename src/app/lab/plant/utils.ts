import { Matrix4, QuadraticBezierCurve3, Shape, Vector3 } from "three";
import { lerp } from "three/src/math/MathUtils.js";

const SEGMENTS = 12;

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
  age: number,
  baseColor: [number, number, number] = [0.2, 0.4, 0.24],
  shadowColor: [number, number, number] = [0.06, 0.1, 0.15],
  subsurfaceColor: [number, number, number] = [0.8, 1.0, 0.3]
) {
  const n = samples;
  const radius = 0.08 * Math.pow(age, 0.5);
  const segments = SEGMENTS;

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
    const r = lerp(radius, 0, easeInExpo(t));
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

      // Color attributes (same for all vertices in leaves)
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
  tipRadius: number = 0.02,
  baseColor: [number, number, number] = [0.2, 0.4, 0.24],
  shadowColor: [number, number, number] = [0.06, 0.1, 0.15],
  subsurfaceColor: [number, number, number] = [0.8, 1.0, 0.3]
) {
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

function easeInExpo(x: number): number {
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
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

/**
 * Creates a 6-sided cylindrical flower geometry
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
  baseColor: [number, number, number] = [1.0, 0.41, 0.71],
  shadowColor: [number, number, number] = [0.5, 0.1, 0.3],
  subsurfaceColor: [number, number, number] = [1.0, 0.7, 0.9]
) {
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
) {
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

    // Bottom wall triangles
    indices.push(o1, i1, i2);
    indices.push(o1, i2, o2);
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

    // Top rim wall triangles (reversed winding for top face)
    indices.push(o1, i2, i1);
    indices.push(o1, o2, i2);
  }

  return {
    vertices: allVertices,
    indices,
    localX,
    localY,
    localZ
  };
}
