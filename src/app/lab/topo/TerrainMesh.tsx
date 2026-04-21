import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { TerrainMaterial } from "./terrainMaterial";
import { forwardToMaterial, type TopoUniforms } from "./uniforms";
import { useBakedAo } from "./useBakedAo";
import { readCssRgb, useBakedHeightmap } from "./useBakedHeightmap";

extend({ TerrainMaterial });

type Props = {
  uniforms: TopoUniforms;
};

export function TerrainMesh({ uniforms }: Props) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2, 256, 256), []);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const heightMap = useBakedHeightmap(uniforms);
  const aoMap = useBakedAo(uniforms, heightMap);

  const lineColor = useMemo<[number, number, number]>(() => [0, 0, 0], []);
  const bgColor = useMemo<[number, number, number]>(() => [1, 1, 1], []);
  const rootStyle = useMemo(
    () =>
      typeof window === "undefined"
        ? null
        : getComputedStyle(document.documentElement),
    []
  );

  useFrame(() => {
    const m = materialRef.current;
    if (!m) return;
    forwardToMaterial(uniforms, m.uniforms);
    if (rootStyle) {
      readCssRgb(rootStyle, "--color-text-rgb", lineColor);
      readCssRgb(rootStyle, "--color-bg-rgb", bgColor);
    }
    (m.uniforms.uLineColor as THREE.IUniform<[number, number, number]>).value =
      lineColor;
    (m.uniforms.uBgColor as THREE.IUniform<[number, number, number]>).value =
      bgColor;
    (m.uniforms.uHeightMap as THREE.IUniform<THREE.Texture>).value = heightMap;
    (m.uniforms.uAoMap as THREE.IUniform<THREE.Texture>).value = aoMap;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[2.8, 2.8, 2.8]} fov={35} />
      <OrbitControls enablePan={true} enableZoom={true} target={[0, 0.3, 0]} />
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        {/* @ts-expect-error — custom shaderMaterial extended at runtime */}
        <terrainMaterial ref={materialRef} />
      </mesh>
    </>
  );
}
