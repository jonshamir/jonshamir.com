import { Billboard, OrbitControls } from "@react-three/drei";
import { extend, ThreeElements, useFrame } from "@react-three/fiber";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { useRef, useState } from "react";
import * as THREE from "three";
import vertexShader from "./circle.vert";
import fragmentShader from "./circle.frag";

import { MaterialNode, Object3DNode } from "@react-three/fiber";

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>;
    meshLineMaterial: MaterialNode<MeshLineMaterial, typeof MeshLineMaterial>;
  }
}

extend({ MeshLineGeometry, MeshLineMaterial });

function Quad(props: ThreeElements["mesh"]) {
  return (
    <mesh {...props}>
      <planeGeometry args={[2, 2]} />
      {/* <meshStandardMaterial wireframe /> */}
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}

export function Scene() {
  return (
    <>
      <OrbitControls position={[0, 0, 0]} />
      <ambientLight intensity={Math.PI / 2} />
      <Billboard>
        <Quad position={[0, 0, 0]} />
      </Billboard>
    </>
  );
}
