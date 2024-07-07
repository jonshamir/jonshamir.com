import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Scene } from "./Scene";

let renderer;

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
    </mesh>
  );
}

export function ThreeTest() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const importWebGPURenderer = async () => {
      const WebGPURenderer = await import(
        "three/addons/renderers/webgpu/WebGPURenderer.js"
      );
      renderer = WebGPURenderer.default;
      setIsMounted(true);
    };
    importWebGPURenderer();
  }, []);

  console.log(renderer);

  return (
    isMounted && (
      <div style={{ width: "100%", height: "20rem" }}>
        <Canvas gl={(canvas) => new renderer({ canvas })}>
          <Scene />
          {/* <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -5, -3]} decay={0} intensity={Math.PI} />
        <Globe position={[0, 0, 0]} /> */}
        </Canvas>
      </div>
    )
  );
}
