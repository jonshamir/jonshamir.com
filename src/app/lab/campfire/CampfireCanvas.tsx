"use client";

import { OrbitControls } from "@react-three/drei";
import { Color } from "three";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { TweakpanePanel } from "../../../components/TweakpanePanel";
import { useControls } from "../../../lib/tweakpane";

export default function CampfireCanvas() {
  const { backgroundColor } = useControls("Display", {
    backgroundColor: { value: "#1a1410", label: "Background" }
  });

  const { radius, height, radialSegments, color } = useControls("Cylinder", {
    radius: { value: 0.5, min: 0.1, max: 2, step: 0.05, label: "Radius" },
    height: { value: 1.5, min: 0.1, max: 4, step: 0.05, label: "Height" },
    radialSegments: {
      value: 32,
      min: 3,
      max: 64,
      step: 1,
      label: "Radial Segments"
    },
    color: { value: "#c66a2b", label: "Color" }
  });

  const bg = new Color(backgroundColor);

  return (
    <>
      <TweakpanePanel />
      <ThreeCanvas
        camera={{ fov: 50, position: [0, 1.5, 4], near: 0.01, far: 100 }}
        isFullscreen={true}
      >
        <color attach="background" args={[bg.r, bg.g, bg.b]} />
        <OrbitControls makeDefault />

        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />

        <mesh>
          <cylinderGeometry args={[radius, radius, height, radialSegments]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </ThreeCanvas>
    </>
  );
}
