import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Group } from "three/webgpu";

import type {
  ColorControls,
  GrainControls,
  MotionControls,
  ShadingControls,
  TopShapeControls
} from "./fruitControls";
import {
  createFruitGeometries,
  type FruitGeometryParams,
  type SurfaceJitter
} from "./fruitGeometry";
import {
  applyColors,
  applyGrain,
  applyJitter,
  applyShading,
  applyTopShape,
  createFruitMaterial,
  createTopMaterial
} from "./fruitMaterial";

export type FruitProps = {
  params: FruitGeometryParams;
  jitter: SurfaceJitter;
  shading: ShadingControls;
  grain: GrainControls;
  motion: MotionControls;
  colors: ColorControls;
  topShape: TopShapeControls;
  showTop: boolean;
  wireframe: boolean;
};

export function Fruit({
  params,
  jitter,
  shading,
  grain,
  motion,
  colors,
  topShape,
  showTop,
  wireframe
}: FruitProps) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * motion.rotationSpeed;
    }
  });

  const { body, top, metrics } = useMemo(
    () => createFruitGeometries(params),
    [params]
  );

  const bodyMaterial = useMemo(() => createFruitMaterial(), []);
  const topMaterial = useMemo(() => createTopMaterial(), []);

  useEffect(() => {
    applyTopShape(topMaterial.uniforms, topShape);
  }, [topShape, topMaterial]);

  useEffect(() => {
    applyShading(bodyMaterial.uniforms, shading);
    // The highlight belongs to the skin. The cap is matte, so it takes the
    // bands and the ambient but no specular term.
    applyShading(topMaterial.uniforms, { ...shading, specStrength: 0 });
  }, [shading, bodyMaterial, topMaterial]);

  useEffect(() => {
    applyJitter(bodyMaterial.uniforms, jitter, metrics);
    // The cap is a fan whose uv has no relation to the profile, so the same
    // displacement would mangle it. Zero also trips the shader's guard, so its
    // material skips the noise entirely.
    applyJitter(
      topMaterial.uniforms,
      { ...jitter, jitterStrength: 0 },
      metrics
    );
  }, [jitter, metrics, bodyMaterial, topMaterial]);

  useEffect(() => {
    applyGrain(bodyMaterial.uniforms, grain);
    // Splatter marks the fruit skin only. The cap still takes the dither, and
    // zeroing the strength here also trips the shader's own guard, so its
    // material skips the worley lookup entirely.
    applyGrain(topMaterial.uniforms, { ...grain, splatterStrength: 0 });
  }, [grain, bodyMaterial, topMaterial]);

  useEffect(() => {
    applyColors(bodyMaterial.uniforms, {
      light: colors.bodyLight,
      shadow: colors.bodyShadow,
      splatter: colors.splatter,
      specular: colors.specular
    });
    applyColors(topMaterial.uniforms, {
      light: colors.topLight,
      shadow: colors.topShadow,
      splatter: colors.splatter,
      specular: colors.specular
    });
  }, [colors, bodyMaterial, topMaterial]);

  useEffect(() => {
    bodyMaterial.material.wireframe = wireframe;
    topMaterial.material.wireframe = wireframe;
  }, [wireframe, bodyMaterial, topMaterial]);

  useEffect(
    () => () => {
      body.dispose();
      top.dispose();
    },
    [body, top]
  );

  useEffect(
    () => () => {
      bodyMaterial.material.dispose();
      topMaterial.material.dispose();
    },
    [bodyMaterial, topMaterial]
  );

  return (
    <group ref={groupRef} position={[0, -params.height / 2, 0]}>
      <mesh geometry={body}>
        <primitive object={bodyMaterial.material} attach="material" />
      </mesh>
      {showTop && (
        <mesh geometry={top}>
          <primitive object={topMaterial.material} attach="material" />
        </mesh>
      )}
    </group>
  );
}
