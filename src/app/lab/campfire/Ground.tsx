"use client";

import { RigidBody, TrimeshCollider } from "@react-three/rapier";
import { useMemo } from "react";
import { BufferAttribute, BufferGeometry } from "three";

import { PIT_DEPTH, PIT_RADIUS } from "./constants";

const GROUND_EXTENT = 4;
const RADIAL_SEGMENTS = 48;
const RING_COUNT = 10;

function buildDishedGround(): BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];

  // Center vertex (single, at the bottom of the dish)
  positions.push(0, -PIT_DEPTH, 0);

  // Rings from innermost outward
  for (let ring = 1; ring <= RING_COUNT; ring++) {
    const t = ring / RING_COUNT;
    const r = t * t * GROUND_EXTENT;
    let y = 0;
    if (r < PIT_RADIUS) {
      const u = r / PIT_RADIUS;
      y = -PIT_DEPTH * Math.cos((u * Math.PI) / 2);
    }
    for (let s = 0; s < RADIAL_SEGMENTS; s++) {
      const theta = (s / RADIAL_SEGMENTS) * Math.PI * 2;
      positions.push(Math.cos(theta) * r, y, Math.sin(theta) * r);
    }
  }

  // Fan of triangles from center vertex to innermost ring
  const innerRingStart = 1;
  for (let s = 0; s < RADIAL_SEGMENTS; s++) {
    const a = 0;
    const b = innerRingStart + s;
    const c = innerRingStart + ((s + 1) % RADIAL_SEGMENTS);
    indices.push(a, c, b);
  }

  // Ring-to-ring quads (as two triangles)
  for (let ring = 1; ring < RING_COUNT; ring++) {
    const ringStart = 1 + (ring - 1) * RADIAL_SEGMENTS;
    const nextStart = 1 + ring * RADIAL_SEGMENTS;
    for (let s = 0; s < RADIAL_SEGMENTS; s++) {
      const a = ringStart + s;
      const b = ringStart + ((s + 1) % RADIAL_SEGMENTS);
      const c = nextStart + s;
      const d = nextStart + ((s + 1) % RADIAL_SEGMENTS);
      indices.push(a, c, b, b, c, d);
    }
  }

  const geom = new BufferGeometry();
  geom.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3)
  );
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

export function Ground({
  onPointerMove,
  onPointerUp
}: {
  onPointerMove?: (e: { point: { x: number; y: number; z: number } }) => void;
  onPointerUp?: (e: { point: { x: number; y: number; z: number } }) => void;
}) {
  const geometry = useMemo(() => buildDishedGround(), []);

  const trimeshArgs = useMemo(() => {
    const vertices = geometry.getAttribute("position").array as Float32Array;
    const indexAttr = geometry.getIndex();
    if (!indexAttr) throw new Error("Dished ground geometry has no index");
    const index = indexAttr.array as Uint16Array | Uint32Array;
    return [new Float32Array(vertices), new Uint32Array(index)] as [
      Float32Array,
      Uint32Array
    ];
  }, [geometry]);

  return (
    <RigidBody type="fixed" colliders={false} friction={0.9}>
      <TrimeshCollider args={trimeshArgs} />
      <mesh
        geometry={geometry}
        receiveShadow
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <meshStandardMaterial color="#4a3a28" roughness={0.95} />
      </mesh>
    </RigidBody>
  );
}
