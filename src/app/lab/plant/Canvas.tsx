"use client";

import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
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
    groundShadowColor,
    plantBaseColor,
    plantShadowColor,
    plantSubsurfaceColor,
    lightPitch,
    lightYaw
  } = useControls({
    currAge: { value: 19, min: 0, max: 200 },
    backgroundColor: { value: "#26334b" },
    groundColor: { value: "#7c4b2c" },
    groundShadowColor: { value: "#262238" },
    plantBaseColor: { value: "#335e3d" },
    plantShadowColor: { value: "#1f3438" },
    plantSubsurfaceColor: { value: "#ccff4d" },
    lightPitch: {
      value: 60,
      min: 0,
      max: 90,
      step: 1,
      label: "Light Pitch (°)"
    },
    lightYaw: { value: 45, min: 0, max: 360, step: 1, label: "Light Yaw (°)" }
  });

  const {
    flowerCount,
    flowerMatureAge,
    flowerBasePitch,
    flowerBaseYaw,
    flowerLayerHeight,
    flowerColor
  } = useControls("Flowers", {
    flowerCount: { value: 10, min: 0, max: 50, step: 1 },
    flowerMatureAge: { value: 30, min: 1, max: 200, step: 1 },
    flowerBasePitch: { value: -1.2, min: -Math.PI, max: Math.PI },
    flowerBaseYaw: { value: GOLDEN_ANGLE, min: 0, max: Math.PI },
    flowerLayerHeight: { value: 0.02, min: 0, max: 0.3 },
    flowerColor: { value: "#ff69b4" }
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

  // Convert plant colors from hex to Color objects
  const plantBaseColorObj = useMemo(() => {
    const color = new Color(plantBaseColor);
    color.convertLinearToSRGB();
    return color;
  }, [plantBaseColor]);

  const plantShadowColorObj = useMemo(() => {
    const color = new Color(plantShadowColor);
    color.convertLinearToSRGB();
    return color;
  }, [plantShadowColor]);

  const plantSubsurfaceColorObj = useMemo(() => {
    const color = new Color(plantSubsurfaceColor);
    color.convertLinearToSRGB();
    return color;
  }, [plantSubsurfaceColor]);

  // Convert flower color from hex to Color object
  const flowerColorObj = useMemo(() => {
    const color = new Color(flowerColor);
    color.convertLinearToSRGB();
    return color;
  }, [flowerColor]);

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
        <Plant
          age={currAge}
          position={[0, -1, 0]}
          baseColor={plantBaseColorObj}
          shadowColor={plantShadowColorObj}
          subsurfaceColor={plantSubsurfaceColorObj}
        />
        <FlowerStem
          growingStage={1}
          position={[0, -1, 0]}
          baseColor={plantBaseColorObj}
          shadowColor={plantShadowColorObj}
          subsurfaceColor={plantSubsurfaceColorObj}
          renderFlower={(tipPosition, flowerScale) => (
            <group position={[tipPosition.x, tipPosition.y, tipPosition.z]}>
              <PhyllotaxisSpawner
                count={flowerCount}
                matureAge={flowerMatureAge}
                baseYaw={flowerBaseYaw}
                basePitch={flowerBasePitch}
                layerHeight={flowerLayerHeight}
                baseColor={flowerColorObj}
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
          <circleGeometry args={[1, 64]} />
          <primitive object={groundMaterial} attach="material" />
        </mesh>
      </ThreeCanvas>
    </>
  );
}
