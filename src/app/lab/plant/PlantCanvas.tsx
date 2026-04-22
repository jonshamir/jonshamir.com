"use client";

import { OrbitControls, StatsGl } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { Color, PCFSoftShadowMap } from "three";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { TweakpanePanel } from "../../../components/TweakpanePanel";
import { useLinearColors } from "../../../lib/hooks/useLinearColor";
import { useControls } from "../../../lib/tweakpane";
import { FlowerStem } from "./FlowerStem";
import { GroundMaterial } from "./groundMaterial";
import { PhyllotaxisSpawner } from "./PhyllotaxisSpawner";
import { Plant } from "./Plant";
import { Pot } from "./Pot";
import { SimpleFlower } from "./SimpleFlower";

const GOLDEN_ANGLE = 2.39996;

export default function PlantCanvas() {
  const {
    groundColor,
    groundShadowColor,
    shadowPlaneEnabled,
    shadowPlaneColor,
    lightPitch,
    lightYaw
  } = useControls(
    "Environment",
    {
      groundColor: { value: "#7c4b2c", label: "Ground Color" },
      groundShadowColor: { value: "#13121a", label: "Ground Shadow Color" },
      shadowPlaneEnabled: { value: true, label: "Shadow Plane Enabled" },
      shadowPlaneColor: { value: "#010007", label: "Shadow Plane Color" },
      lightPitch: {
        value: 60,
        min: 0,
        max: 90,
        step: 1,
        label: "Light Pitch (°)"
      },
      lightYaw: {
        value: 130,
        min: 0,
        max: 360,
        step: 1,
        label: "Light Yaw (°)"
      }
    },
    { collapsed: true }
  ) as {
    groundColor: string;
    groundShadowColor: string;
    shadowPlaneEnabled: boolean;
    shadowPlaneColor: string;
    lightPitch: number;
    lightYaw: number;
  };

  const { currAge } = useControls({
    currAge: { value: 19, min: 0, max: 200 }
  }) as { currAge: number };

  const { leafBaseColor, leafShadowColor, leafSubsurfaceColor } = useControls(
    "Leaf Colors",
    {
      leafBaseColor: { value: "#458052", label: "Base Color" },
      leafShadowColor: { value: "#1f3438", label: "Shadow Color" },
      leafSubsurfaceColor: { value: "#b7ff00", label: "Subsurface Color" }
    },
    { collapsed: true }
  ) as {
    leafBaseColor: string;
    leafShadowColor: string;
    leafSubsurfaceColor: string;
  };

  const { flowerBaseColor, flowerShadowColor, flowerSubsurfaceColor } =
    useControls(
      "Flower Colors",
      {
        flowerBaseColor: { value: "#a8b2f8", label: "Base Color" },
        flowerShadowColor: { value: "#5258ba", label: "Shadow Color" },
        flowerSubsurfaceColor: { value: "#6300ff", label: "Subsurface Color" }
      },
      { collapsed: true }
    ) as {
      flowerBaseColor: string;
      flowerShadowColor: string;
      flowerSubsurfaceColor: string;
    };

  const { fCount, fMatureAge, fBasePitch, fBaseYaw, fLayerHeight } =
    useControls(
      "Flowers",
      {
        fCount: { value: 28, min: 0, max: 50, step: 1 },
        fMatureAge: { value: 30, min: 1, max: 200, step: 1 },
        fBasePitch: { value: -3, min: -Math.PI, max: Math.PI },
        fBaseYaw: { value: GOLDEN_ANGLE, min: 0, max: Math.PI },
        fLayerHeight: { value: 0.018, min: 0, max: 0.3 }
      },
      { collapsed: true }
    ) as {
      fCount: number;
      fMatureAge: number;
      fBasePitch: number;
      fBaseYaw: number;
      fLayerHeight: number;
    };

  const { potBaseColor, potShadowColor } = useControls(
    "Pot Colors",
    {
      potBaseColor: { value: "#ad826c", label: "Base Color" },
      potShadowColor: { value: "#201d2e", label: "Shadow Color" }
    },
    { collapsed: true }
  ) as { potBaseColor: string; potShadowColor: string };

  const {
    potHeight,
    potBottomRadius,
    potTopRadius,
    potRimHeight,
    potRimThickness,
    potThickness
  } = useControls(
    "Pot Dimensions",
    {
      potHeight: {
        value: 0.4,
        min: 0.1,
        max: 2.0,
        step: 0.05,
        label: "Height"
      },
      potBottomRadius: {
        value: 0.15,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        label: "Bottom Radius"
      },
      potTopRadius: {
        value: 0.25,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        label: "Top Radius"
      },
      potRimHeight: {
        value: 0.11,
        min: 0.01,
        max: 0.5,
        step: 0.01,
        label: "Rim Height"
      },
      potRimThickness: {
        value: 0.025,
        min: 0.01,
        max: 0.2,
        step: 0.01,
        label: "Rim Thickness"
      },
      potThickness: {
        value: 0.01,
        min: 0.01,
        max: 0.1,
        step: 0.01,
        label: "Wall Thickness"
      }
    },
    { collapsed: true }
  ) as {
    potHeight: number;
    potBottomRadius: number;
    potTopRadius: number;
    potRimHeight: number;
    potRimThickness: number;
    potThickness: number;
  };

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

  const colors = useLinearColors({
    leafBase: leafBaseColor,
    leafShadow: leafShadowColor,
    leafSubsurface: leafSubsurfaceColor,
    flowerBase: flowerBaseColor,
    flowerShadow: flowerShadowColor,
    flowerSubsurface: flowerSubsurfaceColor,
    potBase: potBaseColor,
    potShadow: potShadowColor,
    shadowPlane: shadowPlaneColor
  });

  return (
    <>
      <TweakpanePanel />
      <ThreeCanvas
        camera={{ fov: 45, position: [0, 0, -5], near: 0.01 }}
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
        <Pot
          position={[0, -0.8, 0]}
          baseColor={colors.potBase}
          shadowColor={colors.potShadow}
          height={potHeight}
          bottomRadius={potBottomRadius}
          topRadius={potTopRadius}
          rimHeight={potRimHeight}
          rimThickness={potRimThickness}
          potThickness={potThickness}
        />
        <Plant
          age={currAge}
          position={[0, -1, 0]}
          baseColor={colors.leafBase}
          shadowColor={colors.leafShadow}
          subsurfaceColor={colors.leafSubsurface}
        />
        <FlowerStem
          growingStage={1}
          position={[0, -1, 0]}
          baseColor={colors.leafBase}
          shadowColor={colors.leafShadow}
          subsurfaceColor={colors.leafSubsurface}
          renderFlower={(tipPosition, flowerScale, curve) => (
            <group>
              <PhyllotaxisSpawner
                count={fCount}
                matureAge={fMatureAge}
                baseYaw={fBaseYaw}
                basePitch={fBasePitch}
                layerHeight={-fLayerHeight}
                curve={curve}
                baseColor={colors.flowerBase}
                shadowColor={colors.flowerShadow}
                subsurfaceColor={colors.flowerSubsurface}
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
          position={[0, -0.88, 0]}
          receiveShadow
          castShadow
        >
          <circleGeometry args={[potTopRadius, 64]} />
          <primitive object={groundMaterial} attach="material" />
        </mesh>
        {/* Transparent ground plane for catching shadows */}
        {shadowPlaneEnabled && (
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1.2, 0]}
            receiveShadow
          >
            <planeGeometry args={[10, 10]} />
            <shadowMaterial color={colors.shadowPlane} opacity={0.3} />
          </mesh>
        )}
      </ThreeCanvas>
    </>
  );
}
