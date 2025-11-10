"use client";

import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import { useEffect, useMemo } from "react";
import { Color, PCFSoftShadowMap } from "three";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { GroundMaterial } from "./groundMaterial";
import { Plant } from "./Plant";

function SceneBackground({ color }: { color: string }) {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new Color(color);
  }, [color, scene]);

  return null;
}

export default function PlantCanvas() {
  const {
    currAge,
    backgroundColor,
    groundColor,
    shadowColor,
    lightPitch,
    lightYaw
  } = useControls({
    currAge: { value: 19, min: 0, max: 200 },
    backgroundColor: { value: "#12121a" },
    groundColor: { value: "#3e2f26" },
    shadowColor: { value: "#16141d" },
    lightPitch: {
      value: 60,
      min: 0,
      max: 90,
      step: 1,
      label: "Light Pitch (°)"
    },
    lightYaw: { value: 45, min: 0, max: 360, step: 1, label: "Light Yaw (°)" }
  });

  // Convert pitch/yaw to cartesian coordinates
  const lightPosition: [number, number, number] = useMemo(() => {
    const pitchRad = (lightPitch * Math.PI) / 180;
    const yawRad = (lightYaw * Math.PI) / 180;
    const distance = 12;

    const x = distance * Math.cos(pitchRad) * Math.cos(yawRad);
    const y = distance * Math.sin(pitchRad);
    const z = distance * Math.cos(pitchRad) * Math.sin(yawRad);

    return [x, y, z];
  }, [lightPitch, lightYaw]);

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
        <SceneBackground color={backgroundColor} />
        <OrbitControls />
        <directionalLight
          position={lightPosition}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={50}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
          shadow-normalBias={0.02}
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
