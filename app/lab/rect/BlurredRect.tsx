import { useEffect, useRef } from "react";
import * as THREE from "three";

import { fragmentShader, vertexShader } from "./blurredRect.glsl";
import { RectProps } from "./Rect";

export type BlurredRectProps = RectProps & {
  blur?: number;
};

type BlurredRectUniforms = {
  uColor: { value: THREE.Color };
  uRadius: { value: THREE.Vector4 };
  uSize: { value: THREE.Vector2 };
  uBlur: { value: number };
};

export function BlurredRect(props: BlurredRectProps) {
  const {
    color = "",
    radius = 0,
    depthTest = true,
    size = { x: 1, y: 1 },
    blur = 0,
    ...rest
  } = props;

  const uniformsRef = useRef<BlurredRectUniforms>({
    uColor: { value: new THREE.Color(color) },
    uRadius: { value: new THREE.Vector4(radius, radius, radius, radius) },
    uSize: { value: new THREE.Vector2(size.x, size.y) },
    uBlur: { value: blur }
  });

  useEffect(() => {
    if (uniformsRef.current === undefined) return;
    // Update uniforms when props change
    uniformsRef.current.uColor.value.set(color);
    const r = Math.min(radius, Math.min(size.x, size.y));
    uniformsRef.current.uRadius.value.set(r, r, r, r);
    uniformsRef.current.uSize.value.set(size.x, size.y);
    uniformsRef.current.uBlur.value = blur;
  }, [color, radius, size, blur]);

  return (
    <mesh {...rest}>
      <planeGeometry args={[size.x, size.y]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthTest={depthTest}
        depthWrite={false}
        transparent={true}
        side={THREE.DoubleSide}
        uniforms={uniformsRef.current}
      />
    </mesh>
  );
}
