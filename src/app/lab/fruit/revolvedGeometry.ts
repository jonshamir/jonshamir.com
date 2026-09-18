import { BufferGeometry, Float32BufferAttribute } from "three/webgpu";

import type { ProfileSample } from "./fruitProfile";

const POLE_EPSILON = 1e-6;

// Sweeps a profile around the Y axis. Normals come from the profile normal
// rather than computeVertexNormals(), which keeps the poles exact.
export function createRevolvedGeometry(
  profile: ProfileSample[],
  radialSegments: number
): BufferGeometry {
  const rows = profile.length;
  // The seam column is duplicated so u reaches 1 instead of wrapping to 0.
  const columns = radialSegments + 1;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  for (const { position, normal, v } of profile) {
    for (let ix = 0; ix < columns; ix++) {
      const u = ix / radialSegments;
      const theta = u * Math.PI * 2;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      positions.push(position.x * cos, position.y, position.x * sin);
      normals.push(normal.x * cos, normal.y, normal.x * sin);
      uvs.push(u, v);
    }
  }

  const indices: number[] = [];

  for (let iy = 0; iy < rows - 1; iy++) {
    // A ring of radius 0 collapses to a single point, so the quad's triangle
    // that has two corners on it is degenerate and is skipped.
    const lowerIsPole = profile[iy].position.x < POLE_EPSILON;
    const upperIsPole = profile[iy + 1].position.x < POLE_EPSILON;

    for (let ix = 0; ix < radialSegments; ix++) {
      const a = iy * columns + ix;
      const b = a + 1;
      const d = a + columns;
      const c = d + 1;

      // This winding faces outward for position = (r·cosθ, y, r·sinθ).
      if (!lowerIsPole) indices.push(a, d, b);
      if (!upperIsPole) indices.push(b, d, c);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}
