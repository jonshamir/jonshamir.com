import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three/webgpu";

// A triangle fan: every polygon on the ring meets at the apex. Vertices are not
// shared between triangles, so each one carries its own face normal and shades
// flat.
export function createFanCapGeometry(
  apex: Vector3,
  ring: Vector3[]
): BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  const toCurrent = new Vector3();
  const toNext = new Vector3();
  const normal = new Vector3();
  const centroid = new Vector3();
  const outward = new Vector3();

  // The ring is planar by construction, so a point on the axis at its height
  // sits inside the fruit and gives a stable "which way is out" reference.
  const pivot = new Vector3(0, ring[0].y, 0);

  for (let i = 0; i < ring.length; i++) {
    const current = ring[i];
    const next = ring[(i + 1) % ring.length];

    toCurrent.subVectors(current, apex);
    toNext.subVectors(next, apex);
    normal.crossVectors(toCurrent, toNext).normalize();

    centroid.copy(apex).add(current).add(next).divideScalar(3);
    outward.subVectors(centroid, pivot);

    // Deriving the winding from the face normal we already need is more robust
    // than hand-reasoning about vertex order, and stays correct if the ring is
    // lifted above the apex.
    const flip = normal.dot(outward) < 0;
    if (flip) normal.negate();

    const first = flip ? next : current;
    const second = flip ? current : next;

    const uCurrent = i / ring.length;
    const uNext = (i + 1) / ring.length;

    positions.push(
      apex.x,
      apex.y,
      apex.z,
      first.x,
      first.y,
      first.z,
      second.x,
      second.y,
      second.z
    );

    for (let k = 0; k < 3; k++) {
      normals.push(normal.x, normal.y, normal.z);
    }

    uvs.push(
      (uCurrent + uNext) / 2,
      0,
      flip ? uNext : uCurrent,
      1,
      flip ? uCurrent : uNext,
      1
    );
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}
