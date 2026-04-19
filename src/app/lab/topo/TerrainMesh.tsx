import { OrbitControls } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

import { TerrainMaterial } from "./terrainMaterial";
import type { TopoUniforms } from "./uniforms";

extend({ TerrainMaterial });

type Props = {
  uniforms: TopoUniforms;
};

export function TerrainMesh({ uniforms }: Props) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2, 256, 256), []);

  return (
    <>
      <OrbitControls enablePan={false} enableZoom={true} />
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        {/* @ts-expect-error — custom shaderMaterial extended at runtime */}
        <terrainMaterial
          uBaseAmplitude={uniforms.uBaseAmplitude.value}
          uBaseFrequency={uniforms.uBaseFrequency.value}
          uBaseOctaves={uniforms.uBaseOctaves.value}
          uDisplacementScale={uniforms.uDisplacementScale.value}
        />
      </mesh>
    </>
  );
}
