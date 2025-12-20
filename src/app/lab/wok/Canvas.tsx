"use client";

import { OrbitControls, StatsGl } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Leva, useControls } from "leva";
import { Suspense } from "react";
import { PCFSoftShadowMap } from "three";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { FoodParticles } from "./FoodParticles";
import { Wok } from "./Wok";

export default function WokCanvas() {
  const { debug, gravity } = useControls(
    "Physics",
    {
      debug: { value: false, label: "Debug" },
      gravity: { value: -7, min: -20, max: 0, step: 0.1, label: "Gravity" }
    },
    { collapsed: true }
  );

  const { radius, depth, flipSpeed, flipAmplitude } = useControls("Wok", {
    radius: { value: 1.5, min: 0.5, max: 3, step: 0.1, label: "Radius" },
    depth: { value: 0.8, min: 0.2, max: 1.5, step: 0.05, label: "Depth" },
    flipSpeed: { value: 0.8, min: 0.1, max: 3, step: 0.1, label: "Flip Speed" },
    flipAmplitude: {
      value: 0.4,
      min: 0.1,
      max: 1.0,
      step: 0.05,
      label: "Flip Amplitude"
    }
  });

  const { phase1Weight, phase2Weight, phase3Weight } = useControls(
    "Animation Phases",
    {
      phase1Weight: {
        value: 60,
        min: 5,
        max: 60,
        step: 5,
        label: "Tilt Back"
      },
      phase2Weight: {
        value: 20,
        min: 5,
        max: 60,
        step: 5,
        label: "Scoop"
      },
      phase3Weight: {
        value: 35,
        min: 5,
        max: 60,
        step: 5,
        label: "Return"
      }
    },
    { collapsed: true }
  );

  const { particleCount } = useControls(
    "Particles",
    {
      particleCount: { value: 100, min: 1, max: 400, step: 10, label: "Count" }
    },
    { collapsed: true }
  );

  return (
    <>
      <Leva />
      <ThreeCanvas
        camera={{ position: [3, 2, 5], fov: 45 }}
        shadows={{ type: PCFSoftShadowMap }}
        isFullscreen
      >
        <StatsGl className="stats-gl" />
        <OrbitControls />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={30}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />

        <Suspense fallback={null}>
          <Physics gravity={[0, gravity, 0]} debug={debug}>
            <Wok
              radius={radius}
              depth={depth}
              flipSpeed={flipSpeed}
              flipAmplitude={flipAmplitude}
              phase1Weight={phase1Weight}
              phase2Weight={phase2Weight}
              phase3Weight={phase3Weight}
            />
            <FoodParticles count={particleCount} wokRadius={radius * 0.8} />
          </Physics>
        </Suspense>
      </ThreeCanvas>
    </>
  );
}
