import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { TerrainMaterial } from "./terrainMaterial";
import { forwardToMaterial, type TopoUniforms } from "./uniforms";
import { useBakedHeightmap } from "./useBakedHeightmap";

extend({ TerrainMaterial });

type Props = {
  uniforms: TopoUniforms;
};

export function TerrainMesh({ uniforms }: Props) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2, 256, 256), []);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const heightMap = useBakedHeightmap(uniforms);

  const lineColor = useMemo<[number, number, number]>(() => [0, 0, 0], []);
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
      const raw = rootStyle.getPropertyValue("--color-text-rgb");
      if (raw) {
        let i = 0;
        let start = 0;
        for (let j = 0; j <= raw.length && i < 3; j++) {
          if (j === raw.length || raw.charCodeAt(j) === 44 /* , */) {
            lineColor[i++] = Number(raw.slice(start, j)) / 255;
            start = j + 1;
          }
        }
      }
    }
    (m.uniforms.uLineColor as THREE.IUniform<[number, number, number]>).value =
      lineColor;
    (m.uniforms.uHeightMap as THREE.IUniform<THREE.Texture>).value = heightMap;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[1.2, 1.2, 1.2]} fov={35} />
      <OrbitControls enablePan={false} enableZoom={true} />
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        {/* @ts-expect-error — custom shaderMaterial extended at runtime */}
        <terrainMaterial ref={materialRef} />
      </mesh>
    </>
  );
}
