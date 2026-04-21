"use client";

import { CylinderCollider, RigidBody } from "@react-three/rapier";
import { useMemo } from "react";

import { PIT_DEPTH, PIT_RADIUS, STONE_COUNT } from "./constants";

type Stone = {
  position: [number, number, number];
  rotationY: number;
  radius: number;
  height: number;
};

function buildStones(): Stone[] {
  const stones: Stone[] = [];
  for (let i = 0; i < STONE_COUNT; i++) {
    const theta = (i / STONE_COUNT) * Math.PI * 2;
    const jitter = (Math.sin(i * 17.3) + 1) * 0.5;
    const radius = 0.055 + 0.025 * jitter;
    const height = 0.08 + 0.04 * jitter;
    const r = PIT_RADIUS * 0.88 + 0.01 * Math.sin(i * 7.1);
    stones.push({
      position: [
        Math.cos(theta) * r,
        -PIT_DEPTH * 0.3 + height / 2,
        Math.sin(theta) * r
      ],
      rotationY: theta + jitter * 1.3,
      radius,
      height
    });
  }
  return stones;
}

export function FirePitStones() {
  const stones = useMemo(() => buildStones(), []);

  return (
    <>
      {stones.map((s, i) => (
        <RigidBody
          key={i}
          type="fixed"
          colliders={false}
          position={s.position}
          rotation={[0, s.rotationY, 0]}
        >
          <CylinderCollider args={[s.height / 2, s.radius]} />
          <mesh castShadow receiveShadow>
            <cylinderGeometry
              args={[s.radius, s.radius * 1.05, s.height, 12]}
            />
            <meshStandardMaterial color="#6a6560" roughness={0.9} />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}
