"use client";

import { BallCollider, RigidBody } from "@react-three/rapier";
import { useMemo, useState } from "react";

import { FoodType, getRandomFoodType } from "./utils/foodTypes";

interface ParticleData {
  type: FoodType;
  position: [number, number, number];
  rotation: [number, number, number];
  id: string;
}

function generateParticleData(
  count: number,
  wokRadius: number
): ParticleData[] {
  const particles: ParticleData[] = [];

  for (let i = 0; i < count; i++) {
    const type = getRandomFoodType();
    // Spawn particles inside the wok bowl
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * wokRadius * 0.6;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = Math.random() * 0.5 + 0.2;

    particles.push({
      type,
      position: [x, y, z],
      rotation: [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      ],
      id: `particle-${i}`
    });
  }

  return particles;
}

interface FoodParticlesProps {
  count?: number;
  wokRadius?: number;
}

export function FoodParticles({
  count = 50,
  wokRadius = 1.2
}: FoodParticlesProps) {
  const [particles] = useState(() => generateParticleData(count, wokRadius));

  return (
    <group>
      {particles.map((particle) => (
        <FoodParticle key={particle.id} particle={particle} />
      ))}
    </group>
  );
}

interface FoodParticleProps {
  particle: ParticleData;
}

function FoodParticle({ particle }: FoodParticleProps) {
  const geometry = useMemo(() => particle.type.geometry(), [particle.type]);

  return (
    <RigidBody
      position={particle.position}
      rotation={particle.rotation}
      colliders={false}
      restitution={particle.type.restitution}
      friction={particle.type.friction}
      mass={particle.type.mass}
      linearDamping={0.5}
      angularDamping={0.5}
      ccd
    >
      <BallCollider args={[particle.type.colliderRadius]} />
      <mesh geometry={geometry} scale={particle.type.scale} castShadow>
        <meshStandardMaterial color={particle.type.color} roughness={0.7} />
      </mesh>
    </RigidBody>
  );
}
