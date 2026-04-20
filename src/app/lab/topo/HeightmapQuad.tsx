import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { ContourMaterial, HeightmapMaterial } from "./heightmapMaterial";
import { forwardToMaterial, type TopoUniforms } from "./uniforms";
import { useBakedHeightmap } from "./useBakedHeightmap";

extend({ HeightmapMaterial, ContourMaterial });

type Props = {
  uniforms: TopoUniforms;
};

export function HeightmapQuad({ uniforms }: Props) {
  const contourRef = useRef<THREE.ShaderMaterial>(null);
  const size = useThree((s) => s.size);

  const heightMap = useBakedHeightmap(uniforms);

  // Line color follows --color-text-rgb on <html>. We re-read every frame
  // (via a live CSSStyleDeclaration) so the shader transitions smoothly
  // together with the rest of the page when the theme class toggles.
  const lineColor = useMemo<[number, number, number]>(() => [0, 0, 0], []);
  const rootStyle = useMemo(
    () =>
      typeof window === "undefined"
        ? null
        : getComputedStyle(document.documentElement),
    []
  );

  useFrame(() => {
    const contour = contourRef.current;
    if (!contour) return;
    forwardToMaterial(uniforms, contour.uniforms);
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
    (
      contour.uniforms.uLineColor as THREE.IUniform<[number, number, number]>
    ).value = lineColor;
    (contour.uniforms.uHeightMap as THREE.IUniform<THREE.Texture>).value =
      heightMap;
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
        <contourMaterial ref={contourRef} transparent />
      </mesh>
    </>
  );
}
