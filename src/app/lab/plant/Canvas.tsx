"use client";

import { OrbitControls, StatsGl } from "@react-three/drei";
import { Leva, useControls } from "leva";
import { useEffect, useMemo } from "react";
import { Color, PCFSoftShadowMap } from "three";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { FlowerStem } from "./FlowerStem";
import { GroundMaterial } from "./groundMaterial";
import { PhyllotaxisSpawner } from "./PhyllotaxisSpawner";
import { Plant } from "./Plant";
import { SimpleFlower } from "./SimpleFlower";

const GOLDEN_ANGLE = 2.39996;

export default function PlantCanvas() {
  const { currAge, groundColor, groundShadowColor, lightPitch, lightYaw } =
    useControls({
      currAge: { value: 19, min: 0, max: 200 },
      groundColor: { value: "#7c4b2c" },
      groundShadowColor: { value: "#262238" },
      lightPitch: {
        value: 60,
        min: 0,
        max: 90,
        step: 1,
        label: "Light Pitch (°)"
      },
      lightYaw: { value: 45, min: 0, max: 360, step: 1, label: "Light Yaw (°)" }
    });

  const { leafBaseColor, leafShadowColor, leafSubsurfaceColor } = useControls(
    "Leaf Colors",
    {
      leafBaseColor: { value: "#458052", label: "Base Color" },
      leafShadowColor: { value: "#1f3438", label: "Shadow Color" },
      leafSubsurfaceColor: { value: "#b7ff00", label: "Subsurface Color" }
    }
  );

  const { flowerBaseColor, flowerShadowColor, flowerSubsurfaceColor } =
    useControls("Flower Colors", {
      flowerBaseColor: { value: "#e861a5", label: "Base Color" },
      flowerShadowColor: { value: "#571758", label: "Shadow Color" },
      flowerSubsurfaceColor: { value: "#ff00aa", label: "Subsurface Color" }
    });

  const { fCount, fMatureAge, fBasePitch, fBaseYaw, fLayerHeight } =
    useControls("Flowers", {
      fCount: { value: 28, min: 0, max: 50, step: 1 },
      fMatureAge: { value: 30, min: 1, max: 200, step: 1 },
      fBasePitch: { value: -3, min: -Math.PI, max: Math.PI },
      fBaseYaw: { value: GOLDEN_ANGLE, min: 0, max: Math.PI },
      fLayerHeight: { value: 0.018, min: 0, max: 0.3 }
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
    const color = new Color(groundShadowColor);
    color.convertLinearToSRGB();
    groundMaterial.shadowColor = color;
  }, [groundShadowColor, groundMaterial]);

  // Convert leaf colors from hex to Color objects
  const leafBaseColorObj = useMemo(() => {
    const color = new Color(leafBaseColor);
    color.convertLinearToSRGB();
    return color;
  }, [leafBaseColor]);

  const leafShadowColorObj = useMemo(() => {
    const color = new Color(leafShadowColor);
    color.convertLinearToSRGB();
    return color;
  }, [leafShadowColor]);

  const leafSubsurfaceColorObj = useMemo(() => {
    const color = new Color(leafSubsurfaceColor);
    color.convertLinearToSRGB();
    return color;
  }, [leafSubsurfaceColor]);

  // Convert flower colors from hex to Color objects
  const flowerBaseColorObj = useMemo(() => {
    const color = new Color(flowerBaseColor);
    color.convertLinearToSRGB();
    return color;
  }, [flowerBaseColor]);

  const flowerShadowColorObj = useMemo(() => {
    const color = new Color(flowerShadowColor);
    color.convertLinearToSRGB();
    return color;
  }, [flowerShadowColor]);

  const flowerSubsurfaceColorObj = useMemo(() => {
    const color = new Color(flowerSubsurfaceColor);
    color.convertLinearToSRGB();
    return color;
  }, [flowerSubsurfaceColor]);

  return (
    <>
      <Leva />
      <ThreeCanvas
        camera={{ fov: 15, position: [0, 0, -13] }}
        isFullscreen={true}
        shadows={{ type: PCFSoftShadowMap }}
      >
        <StatsGl className="stats-gl" />
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
        <Plant
          age={currAge}
          position={[0, -1, 0]}
          baseColor={leafBaseColorObj}
          shadowColor={leafShadowColorObj}
          subsurfaceColor={leafSubsurfaceColorObj}
        />
        <FlowerStem
          growingStage={1}
          position={[0, -1, 0]}
          baseColor={leafBaseColorObj}
          shadowColor={leafShadowColorObj}
          subsurfaceColor={leafSubsurfaceColorObj}
          renderFlower={(tipPosition, flowerScale, curve) => (
            <group>
              <PhyllotaxisSpawner
                count={fCount}
                matureAge={fMatureAge}
                baseYaw={fBaseYaw}
                basePitch={fBasePitch}
                layerHeight={-fLayerHeight}
                curve={curve}
                baseColor={flowerBaseColorObj}
                shadowColor={flowerShadowColorObj}
                subsurfaceColor={flowerSubsurfaceColorObj}
                renderElement={(spawnProps) => (
                  <SimpleFlower
                    key={spawnProps.index}
                    {...spawnProps}
                    growingStage={spawnProps.growingStage * flowerScale}
                  />
                )}
              />
            </group>
          )}
        />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.95, 0]}
          receiveShadow
        >
          <circleGeometry args={[0.8, 64]} />
          <primitive object={groundMaterial} attach="material" />
        </mesh>
      </ThreeCanvas>
    </>
  );
}
