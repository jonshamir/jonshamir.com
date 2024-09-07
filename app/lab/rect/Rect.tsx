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

export function Rect(props: RectProps) {
  const {
    color = "",
    radius = 0,
    depthTest = true,
    size = { x: 1, y: 1 },
    ...rest
  } = props;

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uRadius: { value: new THREE.Vector4(radius, radius, radius, radius) },
      uSize: { value: new THREE.Vector2(size.x, size.y) }
    }),
    []
  );

  useEffect(() => {
    if (!materialRef.current) return;

    // Update uniforms when props change
    materialRef.current.uniforms.uColor.value.set(color);
    const r = Math.min(radius, Math.min(size.x, size.y));
    materialRef.current.uniforms.uRadius.value.set(r, r, r, r);
    materialRef.current.uniforms.uSize.value.set(size.x, size.y);
    materialRef.current.uniformsNeedUpdate = true;
  }, [color, radius, size]);

  return (
    <mesh {...rest}>
      <planeGeometry args={[size.x, size.y]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={rectVertexShader}
        fragmentShader={rectFragmentShader}
        depthTest={depthTest}
        depthWrite={false}
        transparent={true}
        side={THREE.DoubleSide}
        uniforms={uniforms}
      />
    </mesh>
  );
}
