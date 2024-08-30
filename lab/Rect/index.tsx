import { OrbitControls } from "@react-three/drei";
import { ThreeElements } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "../../components/ThreeCanvas/ThreeCanvas";
import { rectFragmentShader, rectVertexShader } from "./rect.glsl";

type RectProps = ThreeElements["mesh"] & {
  color?: THREE.ColorRepresentation;
  depthTest?: boolean;
  radius?: number;
  shadow?: boolean;
};

function Rect(props: RectProps) {
  const { color = "", radius = 0, depthTest = true, ...rest } = props;

  const materialRef = useRef<THREE.ShaderMaterial>();
  const colorRef = useRef(new THREE.Color(color));
  const radiusRef = useRef(new THREE.Vector4(radius, radius, radius, radius));

  const uniforms = useMemo(
    () => ({
      uColor: { value: colorRef.current },
      uRadius: { value: radiusRef.current },
    }),
    [color, radius]
  );

  // Update color uniform when color prop changes
  useEffect(() => {
    if (materialRef.current) {
      colorRef.current.set(color);
      radiusRef.current.set(radius, radius, radius, radius);
      materialRef.current.uniformsNeedUpdate = true;
    }
  }, [color, radius]);

  return (
    <mesh {...rest}>
      <planeGeometry args={[2, 2]} />
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
  const { color, radius } = useControls({
    color: { value: "#5772ad", label: "Color" },
    radius: { value: 0.3, min: 0, max: 1, label: "Radius" },
  });

  return (
    <ThreeCanvas
      camera={{ position: [0, 0, 10], zoom: 3.5 }}
      style={{ backgroundColor: "grey" }}
    >
      <OrbitControls enablePan={false} enableZoom={false} />
      <Rect color={color} radius={radius} />
    </ThreeCanvas>
  );
}
