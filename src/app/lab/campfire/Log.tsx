"use client";

import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
  useFixedJoint
} from "@react-three/rapier";
import { createRef, type RefObject, useEffect, useMemo } from "react";
import { Euler, Quaternion, Vector3 } from "three";

import { LOG_FRICTION, LOG_KINDS, LOG_RESTITUTION } from "./constants";
import type { LogSpec } from "./types";

function JointBetween({
  bodyA,
  bodyB,
  halfLen
}: {
  bodyA: RefObject<RapierRigidBody | null>;
  bodyB: RefObject<RapierRigidBody | null>;
  halfLen: number;
}) {
  useFixedJoint(
    bodyA as RefObject<RapierRigidBody>,
    bodyB as RefObject<RapierRigidBody>,
    [
      [0, halfLen, 0],
      [0, 0, 0, 1],
      [0, -halfLen, 0],
      [0, 0, 0, 1]
    ]
  );
  return null;
}

export function Log({
  spec,
  onPointerDown,
  onRegisterFirstBody
}: {
  spec: LogSpec;
  onPointerDown?: (id: string) => void;
  onRegisterFirstBody?: (id: string, body: RapierRigidBody | null) => void;
}) {
  const kind = LOG_KINDS[spec.kind];
  const segLen = spec.length / spec.segmentCount;
  const halfLen = segLen / 2;
  const capsuleHalfHeight = Math.max(0.001, halfLen - spec.radius);

  const refs = useMemo(
    () =>
      Array.from({ length: spec.segmentCount }, () =>
        createRef<RapierRigidBody>()
      ),
    [spec.segmentCount]
  );

  // Body rotation: align body-local Y (capsule axis) with a horizontal direction.
  // RigidBody only accepts `rotation` (Euler), not `quaternion` — so we build the
  // quaternion we want and convert to default-order (XYZ) Euler.
  const bodyEuler = useMemo<[number, number, number]>(() => {
    const q1 = new Quaternion().setFromAxisAngle(
      new Vector3(0, 0, 1),
      -Math.PI / 2
    );
    const q2 = new Quaternion().setFromAxisAngle(
      new Vector3(0, 1, 0),
      spec.rotationY
    );
    const q = q2.multiply(q1);
    const e = new Euler().setFromQuaternion(q, "XYZ");
    return [e.x, e.y, e.z];
  }, [spec.rotationY]);

  const axis = useMemo(
    () => new Vector3(Math.cos(spec.rotationY), 0, Math.sin(spec.rotationY)),
    [spec.rotationY]
  );

  const segmentPositions = useMemo(() => {
    const [px, py, pz] = spec.position;
    const arr: [number, number, number][] = [];
    const startOffset = -(spec.length / 2) + segLen / 2;
    for (let i = 0; i < spec.segmentCount; i++) {
      const t = startOffset + i * segLen;
      arr.push([px + axis.x * t, py, pz + axis.z * t]);
    }
    return arr;
  }, [spec.position, spec.length, segLen, spec.segmentCount, axis]);

  useEffect(() => {
    const body = refs[0].current;
    if (!body || !onRegisterFirstBody) return;
    onRegisterFirstBody(spec.id, body);
    return () => onRegisterFirstBody(spec.id, null);
  }, [spec.id, onRegisterFirstBody, refs]);

  return (
    <>
      {segmentPositions.map((pos, i) => (
        <RigidBody
          key={i}
          ref={refs[i]}
          type="dynamic"
          position={pos}
          rotation={bodyEuler}
          colliders={false}
          friction={LOG_FRICTION}
          restitution={LOG_RESTITUTION}
          linearDamping={0.3}
          angularDamping={0.4}
          ccd={spec.radius < 0.01}
        >
          <CapsuleCollider args={[capsuleHalfHeight, spec.radius]} />
          <mesh
            castShadow
            receiveShadow
            onPointerDown={(e) => {
              e.stopPropagation();
              onPointerDown?.(spec.id);
            }}
          >
            <cylinderGeometry args={[spec.radius, spec.radius, segLen, 10]} />
            <meshStandardMaterial color={kind.color} roughness={0.85} />
          </mesh>
        </RigidBody>
      ))}
      {refs.slice(1).map((ref, i) => (
        <JointBetween
          key={`j${i}`}
          bodyA={refs[i]}
          bodyB={ref}
          halfLen={halfLen}
        />
      ))}
    </>
  );
}
