"use client";

import { OrbitControls } from "@react-three/drei";
import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";

export default function CampfireCanvas() {
  return (
    <ThreeCanvas
      isFullscreen={true}
      camera={{ position: [3, 2, 3], fov: 50 }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <OrbitControls />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </ThreeCanvas>
  );
}
