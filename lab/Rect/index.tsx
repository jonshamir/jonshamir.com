import { OrbitControls } from "@react-three/drei";
import { ThreeCanvas } from "../../components/ThreeCanvas/ThreeCanvas";
import * as THREE from "three";
import { ThreeElements } from "@react-three/fiber";
import { rectFragmentShader, rectVertexShader } from "./rect.glsl";

type RectProps = ThreeElements["mesh"] & {
  color?: THREE.Color;
  depthTest?: boolean;
  radius?: number;
  shadow?: boolean;
};

function Rect(props: RectProps) {
  const { color = new THREE.Color(), depthTest = true, ...rest } = props;
  return (
    <mesh {...rest}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={rectVertexShader}
        fragmentShader={rectFragmentShader}
        depthTest={depthTest}
        depthWrite={false}
        transparent={true}
        side={THREE.DoubleSide}
        uniforms={{
          uColor: { value: color },
        }}
      />
    </mesh>
  );
}

export default function RectCanvas() {
  return (
    <>
      <div style={{ width: "100%" }}>
        <ThreeCanvas
          camera={{ position: [0, 0, 10], zoom: 3.5 }}
          style={{ backgroundColor: "grey" }}
        >
          <OrbitControls enablePan={false} enableZoom={false} />
          <Rect />
          <directionalLight position={[0, 0, 5]} intensity={1} />
        </ThreeCanvas>
      </div>
    </>
  );
}
