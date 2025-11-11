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
      shadowPlaneColor: { value: "#050314", label: "Shadow Plane Color" },
      lightPitch: {
        value: 60,
        min: 0,
        max: 90,
        step: 1,
        label: "Light Pitch (°)"
      },
      lightYaw: { value: 45, min: 0, max: 360, step: 1, label: "Light Yaw (°)" }
    },
    { collapsed: true }
  );

  const { currAge } = useControls({
    currAge: { value: 19, min: 0, max: 200 }
  });

  const { leafBaseColor, leafShadowColor, leafSubsurfaceColor } = useControls(
    "Leaf Colors",
    {
      leafBaseColor: { value: "#458052", label: "Base Color" },
      leafShadowColor: { value: "#1f3438", label: "Shadow Color" },
      leafSubsurfaceColor: { value: "#b7ff00", label: "Subsurface Color" }
    },
    { collapsed: true }
  );

  const { flowerBaseColor, flowerShadowColor, flowerSubsurfaceColor } =
    useControls(
      "Flower Colors",
      {
        flowerBaseColor: { value: "#a8b2f8", label: "Base Color" },
        flowerShadowColor: { value: "#5258ba", label: "Shadow Color" },
        flowerSubsurfaceColor: { value: "#6300ff", label: "Subsurface Color" }
      },
      { collapsed: true }
    );

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
    );

  const { potBaseColor, potShadowColor } = useControls(
    "Pot Colors",
    {
      potBaseColor: { value: "#cc8866", label: "Base Color" },
      potShadowColor: { value: "#201d2e", label: "Shadow Color" }
    },
    { collapsed: true }
  );

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
        value: 0.5,
        min: 0.1,
        max: 2.0,
        step: 0.05,
        label: "Height"
      },
      potBottomRadius: {
        value: 0.2,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        label: "Bottom Radius"
      },
      potTopRadius: {
        value: 0.3,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        label: "Top Radius"
      },
      potRimHeight: {
        value: 0.13,
        min: 0.01,
        max: 0.5,
        step: 0.01,
        label: "Rim Height"
      },
      potRimThickness: {
        value: 0.03,
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
  );

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

  // Convert pot colors from hex to Color objects
  const potBaseColorObj = useMemo(() => {
    const color = new Color(potBaseColor);
    color.convertLinearToSRGB();
    return color;
  }, [potBaseColor]);

  const potShadowColorObj = useMemo(() => {
    const color = new Color(potShadowColor);
    color.convertLinearToSRGB();
    return color;
  }, [potShadowColor]);

  // Convert shadow plane color from hex to Color object
  const shadowPlaneColorObj = useMemo(() => {
    const color = new Color(shadowPlaneColor);
    color.convertLinearToSRGB();
    return color;
  }, [shadowPlaneColor]);

  return (
    <>
      <Leva />
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
          baseColor={potBaseColorObj}
          shadowColor={potShadowColorObj}
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
          position={[0, -0.93, 0]}
          receiveShadow
          castShadow
        >
          <circleGeometry args={[0.3, 64]} />
          <primitive object={groundMaterial} attach="material" />
        </mesh>
        {/* Transparent ground plane for catching shadows */}
        {shadowPlaneEnabled && (
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1.3, 0]}
            receiveShadow
          >
            <planeGeometry args={[10, 10]} />
            <shadowMaterial color={shadowPlaneColorObj} opacity={0.3} />
          </mesh>
        )}
      </ThreeCanvas>
    </>
  );
}
