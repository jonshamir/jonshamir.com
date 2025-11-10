"use client";

import { OrbitControls } from "@react-three/drei";
import { Leva, useControls } from "leva";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { Plant } from "./Plant";

export default function PlantCanvas() {
  const { currAge } = useControls({
    currAge: { value: 18, min: 0, max: 200 }
  });

  return (
    <>
      <Leva />
      <ThreeCanvas
        camera={{ fov: 15, position: [0, 0, -10] }}
        isFullscreen={true}
        shadows
      >
        <OrbitControls />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
          shadow-normalBias={0.02}
        />
        <ambientLight intensity={0.4} />
        <Plant age={currAge} position={[0, -1, 0]} />
      </ThreeCanvas>
    </>
  );
}
