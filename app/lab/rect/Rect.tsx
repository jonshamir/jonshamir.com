import { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { rectFragmentShader, rectVertexShader } from "./rect.glsl";

type RectProps = ThreeElements["mesh"] & {
  size?: { x: number; y: number };
  color?: THREE.ColorRepresentation;
  depthTest?: boolean;
  radius?: number;
  shadow?: boolean;
};

type RectUniforms = {
  uColor: { value: THREE.Color };
  uRadius: { value: THREE.Vector4 };
  uSize: { value: THREE.Vector2 };
};

export function Rect(props: RectProps) {
  const {
    color = "",
    radius = 0,
    depthTest = true,
    size = { x: 1, y: 1 },
    ...rest
  } = props;

  const uniformsRef = useRef<RectUniforms>({
    uColor: { value: new THREE.Color(color) },
    uRadius: { value: new THREE.Vector4(radius, radius, radius, radius) },
    uSize: { value: new THREE.Vector2(size.x, size.y) }
  });

  useEffect(() => {
    if (uniformsRef.current === undefined) return;
    // Update uniforms when props change
    uniformsRef.current.uColor.value.set(color);
    const r = Math.min(radius, Math.min(size.x, size.y));
    uniformsRef.current.uRadius.value.set(r, r, r, r);
    uniformsRef.current.uSize.value.set(size.x, size.y);
  }, [color, radius, size]);

  return (
    <mesh {...rest}>
      <planeGeometry args={[size.x, size.y]} />
      <shaderMaterial
        vertexShader={rectVertexShader}
        fragmentShader={rectFragmentShader}
        depthTest={depthTest}
        depthWrite={false}
        transparent={true}
        side={THREE.DoubleSide}
        uniforms={uniformsRef.current}
      />
    </mesh>
  );
}
