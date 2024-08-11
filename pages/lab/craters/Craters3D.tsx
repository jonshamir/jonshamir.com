import { Canvas } from "@react-three/fiber";

import styles from "./ThreeTest.module.scss";
import { OrbitControls } from "@react-three/drei";
import { MoonCraters } from "./MoonCraters";

export function Craters3D() {
  return (
    <>
      <div style={{ width: "100%" }} className={styles.ThreeTest}>
        <Canvas camera={{ position: [0, 0, 10], zoom: 6 }}>
          <OrbitControls enablePan={false} enableZoom={false} />
          <MoonCraters />
        </Canvas>
      </div>
    </>
  );
}
