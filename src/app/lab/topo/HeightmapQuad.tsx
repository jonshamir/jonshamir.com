import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
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
  const size = useThree((s) => s.size);

  useFrame(() => {
    const m = materialRef.current;
    if (!m) return;
    forwardToMaterial(uniforms, m.uniforms);
  });

  const aspect = size.width / size.height;
  const [left, right, top, bottom] =
    aspect >= 1 ? [-1, 1, 1 / aspect, -1 / aspect] : [-aspect, aspect, 1, -1];

  return (
    <>
      <OrthographicCamera
        makeDefault
        manual
        left={left}
        right={right}
        top={top}
        bottom={bottom}
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
