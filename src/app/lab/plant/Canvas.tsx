"use client";

import { OrbitControls } from "@react-three/drei";
import { Leva, useControls } from "leva";
import { useEffect, useMemo } from "react";
import { Color, PCFShadowMap, PCFSoftShadowMap, VSMShadowMap } from "three";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { GroundMaterial } from "./groundMaterial";
import { Plant } from "./Plant";

export default function PlantCanvas() {
  const { currAge, groundColor, shadowColor } = useControls({
    currAge: { value: 18, min: 0, max: 200 },
    groundColor: { value: "#3e2f26" },
    shadowColor: { value: "#16141d" }
  });

  const groundMaterial = useMemo(() => new GroundMaterial(), []);

  useEffect(() => {
    const color = new Color(groundColor);
    color.convertLinearToSRGB();
    groundMaterial.baseColor = color;
  }, [groundColor, groundMaterial]);

  useEffect(() => {
    const color = new Color(shadowColor);
    color.convertLinearToSRGB();
    groundMaterial.shadowColor = color;
  }, [shadowColor, groundMaterial]);

  return (
    <>
      <Leva />
      <ThreeCanvas
        camera={{ fov: 15, position: [0, 0, -10] }}
        isFullscreen={true}
        shadows={{ type: PCFSoftShadowMap }}
      >
        <OrbitControls />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={50}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
          shadow-normalBias={0.0}
          shadow-bias={-0.0012}
          shadow-radius={2}
        />
        <ambientLight intensity={0.4} />
        <Plant age={currAge} position={[0, -1, 0]} />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.95, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <primitive object={groundMaterial} attach="material" />
        </mesh>
      </ThreeCanvas>
    </>
  );
}
