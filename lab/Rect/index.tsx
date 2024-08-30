import { OrbitControls } from "@react-three/drei";
import { ThreeElements } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "../../components/ThreeCanvas/ThreeCanvas";
import { rectFragmentShader, rectVertexShader } from "./rect.glsl";

type RectProps = ThreeElements["mesh"] & {
  size?: { x: number; y: number };
  color?: THREE.ColorRepresentation;
  depthTest?: boolean;
  radius?: number;
  shadow?: boolean;
};

function Rect(props: RectProps) {
  const { color = "", radius = 0, depthTest = true, size, ...rest } = props;

  const materialRef = useRef<THREE.ShaderMaterial>();
  const colorRef = useRef(new THREE.Color(color));
  const radiusRef = useRef(new THREE.Vector4(radius, radius, radius, radius));
  const sizeRef = useRef(new THREE.Vector2(size.x, size.y));

  const uniforms = useMemo(
    () => ({
      uColor: { value: colorRef.current },
      uRadius: { value: radiusRef.current },
      uSize: { value: sizeRef.current },
    }),
    [color, radius]
  );

  // Update uniforms when props change
  useEffect(() => {
    const r = Math.min(radius, Math.min(size.x, size.y));
    if (materialRef.current) {
      colorRef.current.set(color);
      radiusRef.current.set(r, r, r, r);
      sizeRef.current.set(size.x, size.y);
      materialRef.current.uniformsNeedUpdate = true;
    }
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

export default function RectCanvas() {
  const controls = useControls({
    color: { value: "#5772ad", label: "Color" },
    radius: { value: 0.3, min: 0, max: 1, label: "Radius" },
    size: {
      value: { x: 1, y: 1 },
      x: { min: 0 },
      y: { min: 0 },
      label: "Size",
    },
  });

  return (
    <ThreeCanvas
      camera={{ position: [0, 0, 10], zoom: 3.5 }}
      style={{ backgroundColor: "grey" }}
    >
      <OrbitControls enablePan={false} enableZoom={false} />
      <Rect
        size={controls.size}
        color={controls.color}
        radius={controls.radius}
      />
    </ThreeCanvas>
  );
}
