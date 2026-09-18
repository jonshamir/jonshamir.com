import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { DoubleSide } from "three/webgpu";

import type {
  ColorControls,
  GrainControls,
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
  colors: ColorControls;
  showTop: boolean;
  wireframe: boolean;
};

export function Fruit({
  params,
  shading,
  grain,
  colors,
  showTop,
  wireframe
}: FruitProps) {
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
    applyShading(topMaterial.uniforms, shading);
  }, [shading, bodyMaterial, topMaterial]);

  // The screen-space grain samples gl_FragCoord, which is in device pixels, so
  // it needs the dpr to express its size in CSS pixels.
  const pixelRatio = useThree((state) => state.viewport.dpr);

  useEffect(() => {
    applyGrain(bodyMaterial.uniforms, grain, pixelRatio);
    applyGrain(topMaterial.uniforms, grain, pixelRatio);
  }, [grain, pixelRatio, bodyMaterial, topMaterial]);

  useEffect(() => {
    applyColors(
      bodyMaterial.uniforms,
      colors.bodyLight,
      colors.bodyShadow,
      colors.splatter
    );
    applyColors(
      topMaterial.uniforms,
      colors.topLight,
      colors.topShadow,
      colors.splatter
    );
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
    <group position={[0, -params.height / 2, 0]}>
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
