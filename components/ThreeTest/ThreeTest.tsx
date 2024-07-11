import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";

import styles from "./Moon.module.scss";

export function ThreeTest() {
  return (
    <div style={{ width: "100%", height: "30rem" }} className={styles.Moon}>
      <Canvas
        orthographic
        camera={{ zoom: 200, position: [0, 0, 10], far: 10 }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
