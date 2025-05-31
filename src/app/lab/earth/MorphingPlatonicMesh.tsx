import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { BaseMesh } from "./ProjectionMapping";

function meshToIndex(mesh: BaseMesh) {
  return {
    [BaseMesh.Sphere]: -1,
    [BaseMesh.Icosahedron]: 0,
    [BaseMesh.Cube]: 1,
    [BaseMesh.Dodecahedron]: 2,
    [BaseMesh.Octahedron]: 3
  }[mesh];
}

export function MorphingPlatonicMesh({
  mesh = BaseMesh.Sphere,
  children
}: {
  mesh?: BaseMesh;
  children?: React.ReactNode;
}) {
  const gltf = useGLTF("/models/platonics.glb");
  const geometry = (gltf.scenes[0].children[0] as THREE.Mesh).geometry;
  const meshRef = useRef<THREE.Mesh>(null);
  const targetIndex = meshToIndex(mesh);

  const initialMorphInfluences = new Float32Array([0.0, 0.0, 0.0, 0.0]);
  const currentInfluences = useRef<number[]>([0, 0, 0, 0]);

  // Ensure geometry has both position and normal morph attributes
  if (!geometry.morphAttributes || !geometry.morphAttributes.position) {
    const positionArray = new Float32Array(
      geometry.attributes.position.array.length
    );
    const normalArray = new Float32Array(
      geometry.attributes.normal.array.length
    );

    geometry.morphAttributes = {
      position: [new THREE.BufferAttribute(positionArray, 3)],
      normal: [new THREE.BufferAttribute(normalArray, 3)]
    };
    geometry.morphTargetsRelative = true;
  }

  useFrame(() => {
    if (meshRef.current && meshRef.current.morphTargetInfluences) {
      // Smoothly transition each influence
      currentInfluences.current.forEach((_, index) => {
        const target = index === targetIndex ? 1 : 0;
        currentInfluences.current[index] = THREE.MathUtils.lerp(
          currentInfluences.current[index],
          target,
          0.1
        );
        const mesh = meshRef.current;
        if (!mesh || !mesh.morphTargetInfluences) return;
        mesh.morphTargetInfluences[index] = currentInfluences.current[index];
      });
    }
  });

  return (
    <mesh
      ref={meshRef}
      morphTargetInfluences={Array.from(initialMorphInfluences)}
      morphTargetDictionary={{}}
    >
      <primitive object={geometry} attach="geometry" />
      {children}
    </mesh>
  );
}
