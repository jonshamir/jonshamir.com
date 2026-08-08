import { Billboard, Sphere } from "@react-three/drei";
import { ThreeElements, useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { Vector3 } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";

import { circleFragmentShader, circleVertexShader } from "./circle.glsl";
import craters from "./craters.json";

const RADIUS = 1;
const MOON_RADIUS = 1737;
const SCALE_RATIO = RADIUS / MOON_RADIUS;
const ROTATION_SPEED = 0.1;

type QuadProps = ThreeElements["mesh"] & {
  color?: THREE.Color;
  depthTest?: boolean;
};

function Quad(props: QuadProps) {
  const { color = new THREE.Color(), depthTest = true, ...rest } = props;
  return (
    <mesh {...rest}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        key={circleVertexShader + circleFragmentShader}
        vertexShader={circleVertexShader}
        fragmentShader={circleFragmentShader}
        depthTest={depthTest}
        depthWrite={false}
        transparent={true}
        side={THREE.DoubleSide}
        uniforms={{
          uColor: { value: color }
        }}
      />
    </mesh>
  );
}

function CraterInstances() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const position = new Vector3();
    const scale = new Vector3();

    craters.forEach((crater, i) => {
      const craterRadius = (crater.diam / 2) * SCALE_RATIO;
      rotation.set(-crater.lon * DEG2RAD, crater.lat * DEG2RAD, 0);
      quaternion.setFromEuler(rotation);
      const zOffset = Math.sqrt(RADIUS * RADIUS - craterRadius * craterRadius);
      position.set(0, 0, zOffset).applyEuler(rotation);
      scale.setScalar(craterRadius);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, craters.length]}
      frustumCulled={false}
    >
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        key={circleVertexShader + circleFragmentShader}
        vertexShader={circleVertexShader}
        fragmentShader={circleFragmentShader}
        depthWrite={false}
        transparent={true}
        side={THREE.DoubleSide}
        uniforms={{
          uColor: { value: new THREE.Color(0xbbbbbb) }
        }}
      />
    </instancedMesh>
  );
}

export function MoonCraters() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += ROTATION_SPEED * Math.min(delta, 0.05);
    }
  });

  return (
    <>
      <Billboard>
        <Quad
          color={new THREE.Color(0xdddddd)}
          position={[0, 0, 0]}
          scale={RADIUS * 1.01}
          renderOrder={1}
          depthTest={false}
        />
      </Billboard>
      <group ref={groupRef}>
        <Sphere args={[RADIUS * 0.99, 32, 32]}>
          <meshBasicMaterial color={new THREE.Color(0x222222)} />
        </Sphere>
        <CraterInstances />
      </group>
      <directionalLight position={[0, 0, 1]} intensity={0.5} />
    </>
  );
}
