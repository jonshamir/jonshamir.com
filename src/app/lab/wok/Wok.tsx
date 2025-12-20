"use client";

import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useWokAnimation } from "./useWokAnimation";
import { createWokGeometry } from "./utils/wokGeometry";

interface WokProps {
  radius?: number;
  depth?: number;
  flipSpeed?: number;
  flipAmplitude?: number;
  phase1Weight?: number;
  phase2Weight?: number;
  phase3Weight?: number;
}

export function Wok({
  radius = 1.5,
  depth = 0.6,
  flipSpeed = 1.0,
  flipAmplitude = 0.4,
  phase1Weight = 30,
  phase2Weight = 30,
  phase3Weight = 40
}: WokProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);

  const geometry = useMemo(
    () => createWokGeometry({ radius, depth }),
    [radius, depth]
  );

  const { getRotation, getPosition } = useWokAnimation({
    speed: flipSpeed,
    amplitude: flipAmplitude,
    phase1Weight,
    phase2Weight,
    phase3Weight
  });

  useFrame((state) => {
    if (rigidBodyRef.current) {
      const time = state.clock.elapsedTime;
      const rotation = getRotation(time);
      const position = getPosition(time);

      rigidBodyRef.current.setNextKinematicRotation(rotation);
      rigidBodyRef.current.setNextKinematicTranslation(position);
    }
  });

  return (
    <RigidBody ref={rigidBodyRef} type="kinematicPosition" colliders="trimesh">
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#4a4a4a"
          metalness={0.6}
          roughness={0.3}
          side={THREE.DoubleSide}
          transparent
          opacity={0.5}
        />
      </mesh>
    </RigidBody>
  );
}
