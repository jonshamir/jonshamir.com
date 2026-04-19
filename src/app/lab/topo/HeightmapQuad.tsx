import { OrthographicCamera } from "@react-three/drei";
import { extend } from "@react-three/fiber";

import { HeightmapMaterial } from "./heightmapMaterial";
import type { TopoUniforms } from "./uniforms";

extend({ HeightmapMaterial });

type Props = {
  uniforms: TopoUniforms;
};

export function HeightmapQuad({ uniforms }: Props) {
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
        <heightmapMaterial
          uBaseAmplitude={uniforms.uBaseAmplitude.value}
          uBaseFrequency={uniforms.uBaseFrequency.value}
          uBaseOctaves={uniforms.uBaseOctaves.value}
          uDisplacementScale={uniforms.uDisplacementScale.value}
        />
      </mesh>
    </>
  );
}
