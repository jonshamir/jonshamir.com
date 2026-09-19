import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { DoubleSide, type Group } from "three/webgpu";

import type {
  ColorControls,
  GrainControls,
  MotionControls,
  ShadingControls
} from "./fruitControls";
import {
  createFruitGeometries,
  type FruitGeometryParams
} from "./fruitGeometry";
import {
  applyColors,
  applyGrain,
  applyShading,
  createFruitMaterial
} from "./fruitMaterial";

export type FruitProps = {
  params: FruitGeometryParams;
  shading: ShadingControls;
  grain: GrainControls;
  motion: MotionControls;
  colors: ColorControls;
  showTop: boolean;
  wireframe: boolean;
};

export function Fruit({
  params,
  shading,
  grain,
  motion,
  colors,
  showTop,
  wireframe
}: FruitProps) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * motion.rotationSpeed;
    }
  });

  const { body, top } = useMemo(() => createFruitGeometries(params), [params]);

  const bodyMaterial = useMemo(() => createFruitMaterial(), []);
  const topMaterial = useMemo(() => {
    const created = createFruitMaterial();
    // The cap's underside shows whenever it flares away from the body.
    created.material.side = DoubleSide;
    return created;
  }, []);

  useEffect(() => {
    applyShading(bodyMaterial.uniforms, shading);
    // The highlight belongs to the skin. The cap is matte, so it takes the
    // bands and the ambient but no specular term.
    applyShading(topMaterial.uniforms, { ...shading, specStrength: 0 });
  }, [shading, bodyMaterial, topMaterial]);

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
