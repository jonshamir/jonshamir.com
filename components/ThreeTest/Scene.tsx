import { OrbitControls } from "@react-three/drei";
import { extend, ThreeElements, useFrame } from "@react-three/fiber";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { useRef, useState } from "react";
import * as THREE from "three";

import { MaterialNode, Object3DNode } from "@react-three/fiber";

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>;
    meshLineMaterial: MaterialNode<MeshLineMaterial, typeof MeshLineMaterial>;
  }
}

extend({ MeshLineGeometry, MeshLineMaterial });

function Globe(props: ThreeElements["mesh"]) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, hover] = useState(false);
  useFrame((state, delta) => (ref.current.rotation.z += delta));
  return (
    <mesh
      {...props}
      ref={ref}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

function Circle(props: ThreeElements["mesh"]) {
  const points = [];
  const r = 1;
  const n = 8;

  for (let i = 0; i < n + 1; i++) {
    const theta = (i / n) * Math.PI * 2;
    points.push([r * Math.cos(theta), r * Math.sin(theta), 0]);
  }

  return (
    <mesh {...props}>
      <meshLineGeometry points={points} />
      <meshLineMaterial lineWidth={0.1} color="white" sizeAttenuation={0} />
    </mesh>
  );
}

export function Scene() {
  return (
    <>
      <OrbitControls />
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -5, -3]} decay={0} intensity={Math.PI} />
      <Circle position={[0, 0, 0]} />
    </>
  );
}
