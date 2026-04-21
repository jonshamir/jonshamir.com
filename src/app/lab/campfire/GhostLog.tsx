"use client";

import { LOG_KINDS } from "./constants";
import type { LogKind } from "./types";

export function GhostLog({
  kind,
  position,
  rotationY
}: {
  kind: LogKind;
  position: [number, number, number];
  rotationY: number;
}) {
  const spec = LOG_KINDS[kind];
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, spec.radius, 0]}>
        <cylinderGeometry args={[spec.radius, spec.radius, spec.length, 14]} />
        <meshStandardMaterial
          color={spec.color}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
