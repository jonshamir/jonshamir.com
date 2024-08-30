import { OrbitControls } from "@react-three/drei";
import { ThreeCanvas } from "../../components/ThreeCanvas/ThreeCanvas";

function Quad(props: QuadProps) {
  const { color = new THREE.Color(), depthTest = true, ...rest } = props;
  return (
    <mesh {...rest}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={circleVertexShader}
        fragmentShader={circleFragmentShader}
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
        <ThreeCanvas camera={{ position: [0, 0, 10], zoom: 3.5 }}>
          <OrbitControls enablePan={false} enableZoom={false} />
          <mesh>
            <planeGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="orange" />
          </mesh>
          <directionalLight position={[0, 0, 5]} intensity={1} />
        </ThreeCanvas>
      </div>
    </>
  );
}
