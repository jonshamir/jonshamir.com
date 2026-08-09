"use client";

import { OrbitControls } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Color, PCFShadowMap } from "three";

import { ParallaxRig } from "../../../components/ThreeCanvas/ParallaxRig";
import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import {
  TimelineDriver,
  useTimelinePlayer
} from "../../../components/ThreeCanvas/TimelinePlayer";
import { TweakpanePanel } from "../../../components/TweakpanePanel";
import { useLinearColors } from "../../../lib/hooks/useLinearColor";
import { useControls } from "../../../lib/tweakpane";
import { FlowerStem } from "./FlowerStem";
import { GroundMaterial } from "./groundMaterial";
import { computeGrowthValues, growthSchema, totalDuration } from "./growth";
import { PhyllotaxisSpawner } from "./PhyllotaxisSpawner";
import { Plant } from "./Plant";
import {
  environmentSchema,
  flowerColorsSchema,
  flowersSchema,
  leafColorsSchema,
  potColorsSchema,
  potDimensionsSchema
} from "./plantControls";
import { Pot } from "./Pot";
import { SimpleFlower } from "./SimpleFlower";
import { saturate } from "./utils";

export default function PlantCanvas({
  controls = true,
  isFullscreen = true
}: {
  controls?: boolean;
  isFullscreen?: boolean;
}) {
  const {
    bgColor,
    groundColor,
    groundShadowColor,
    shadowPlaneEnabled,
    shadowPlaneColor,
    lightPitch,
    lightYaw
  } = useControls("Environment", environmentSchema, { collapsed: true });

  const { currAge } = useControls({
    currAge: { value: 19, min: 0, max: 200 }
  });

  const player = useTimelinePlayer();

  const { progress, ...animParams } = useControls(
    "Animation",
    {
      ...growthSchema,
      progress: { value: 0, min: 0, max: 1, step: 0.001, label: "Progress" },
      replay: { button: player.replay, label: "Replay" }
    },
    { collapsed: true }
  );

  const paramsRef = useRef(animParams);
  paramsRef.current = animParams;
  const getDuration = useCallback(() => totalDuration(paramsRef.current), []);

  // Scrubbing the progress slider pauses playback and jumps the plant there.
  // Guard on the value changing, not on "first run": effects can re-run with
  // refs intact (dev double-invoke, hidden remounts), which would kill autoplay.
  const { scrubTo } = player;
  const lastScrub = useRef(progress);
  useEffect(() => {
    if (progress === lastScrub.current) return;
    lastScrub.current = progress;
    scrubTo(progress);
  }, [progress, scrubTo]);

  const anim = computeGrowthValues(player.progress, animParams);

  const { leafBaseColor, leafShadowColor, leafSubsurfaceColor } = useControls(
    "Leaf Colors",
    leafColorsSchema,
    { collapsed: true }
  );

  const { flowerBaseColor, flowerShadowColor, flowerSubsurfaceColor } =
    useControls("Flower Colors", flowerColorsSchema, { collapsed: true });

  const { fCount, fMatureAge, fBasePitch, fBaseYaw, fLayerHeight } =
    useControls("Flowers", flowersSchema, { collapsed: true });

  const { potBaseColor, potShadowColor } = useControls(
    "Pot Colors",
    potColorsSchema,
    { collapsed: true }
  );

  const {
    potHeight,
    potBottomRadius,
    potTopRadius,
    potRimHeight,
    potRimThickness,
    potThickness
  } = useControls("Pot Dimensions", potDimensionsSchema, { collapsed: true });

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

  const shadowMapSize = isFullscreen ? 4096 : 2048;
  // normalBias is in world units and must grow with shadow texel size
  const shadowNormalBias = 0.02 * (4096 / shadowMapSize);

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
      {controls && <TweakpanePanel />}
      <ThreeCanvas
        camera={{
          fov: 45,
          position: isFullscreen ? [0, 0, -5] : [0, -0.3, -4.3],
          near: 0.01
        }}
        isFullscreen={isFullscreen}
        grabCursor={isFullscreen}
        shadows={{ type: PCFShadowMap }}
        frameloop={isFullscreen ? "always" : "demand"}
        style={{ backgroundColor: `var(--canvas-bg, ${bgColor})` }}
      >
        {/* <StatsGl className="stats-gl" /> */}
        <TimelineDriver player={player} getDuration={getDuration} />
        <OrbitControls
          target={isFullscreen ? [0, 0, 0] : [0, -0.3, 0]}
          enableZoom={isFullscreen}
          enableRotate={isFullscreen}
          enablePan={isFullscreen}
        />
        <ambientLight intensity={0.4} />
        <ParallaxRig enabled={!isFullscreen}>
          <directionalLight
            position={lightPosition}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={shadowMapSize}
            shadow-mapSize-height={shadowMapSize}
            shadow-camera-far={50}
            shadow-camera-left={-3}
            shadow-camera-right={3}
            shadow-camera-top={3}
            shadow-camera-bottom={-3}
            shadow-normalBias={shadowNormalBias}
            shadow-radius={5}
          />
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
          {/* Scale group carries the plant's base position so growth scales
              from the pot rim, not the world origin. */}
          <group position={[0, -1, 0]} scale={anim.scale}>
            <Plant
              age={currAge}
              maturity={anim.leaves}
              matureAgeStartMult={animParams.matureAgeMult}
              baseColor={colors.leafBase}
              shadowColor={colors.leafShadow}
              subsurfaceColor={colors.leafSubsurface}
            />
            <FlowerStem
              growingStage={anim.stalk}
              flowerStage={anim.flowers}
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
                        growingStage={
                          spawnProps.growingStage *
                          saturate(
                            flowerScale * (1 + animParams.flowerStagger) -
                              (spawnProps.index / fCount) *
                                animParams.flowerStagger
                          )
                        }
                      />
                    )}
                  />
                </group>
              )}
            />
          </group>
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
        </ParallaxRig>
      </ThreeCanvas>
    </>
  );
}
