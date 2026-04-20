import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { HeightmapMaterial } from "./heightmapMaterial";
import { forwardToMaterial, type TopoUniforms } from "./uniforms";

extend({ HeightmapMaterial });

type Props = {
  uniforms: TopoUniforms;
};

export function HeightmapQuad({ uniforms }: Props) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(() => {
    const m = materialRef.current;
    if (!m) return;
    forwardToMaterial(uniforms, m.uniforms);
  });

  return (
    <>
      <OrthographicCamera
        makeDefault
        left={-1}
        right={1}
        top={1}
        bottom={-1}
        near={-1}
        far={1}
      />
      <mesh>
        <planeGeometry args={[2, 2]} />
        {/* @ts-expect-error — custom shaderMaterial extended at runtime */}
        <heightmapMaterial ref={materialRef} />
      </mesh>
    </>
  );
}
