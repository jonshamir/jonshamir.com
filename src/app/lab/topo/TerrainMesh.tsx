import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { TerrainMaterial } from "./terrainMaterial";
import { forwardToMaterial, type TopoUniforms } from "./uniforms";

extend({ TerrainMaterial });

type Props = {
  uniforms: TopoUniforms;
};

export function TerrainMesh({ uniforms }: Props) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2, 256, 256), []);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(() => {
    const m = materialRef.current;
    if (!m) return;
    forwardToMaterial(uniforms, m.uniforms);
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
