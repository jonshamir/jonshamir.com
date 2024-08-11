import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import styles from "./ThreeCanvas.module.scss";

export function ThreeCanvas({
  children,
  ...rest
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ width: "100%" }} className={styles.ThreeTest}>
      <Canvas {...rest}>
        <OrbitControls enablePan={false} enableZoom={false} />
        {children}
      </Canvas>
    </div>
  );
}
