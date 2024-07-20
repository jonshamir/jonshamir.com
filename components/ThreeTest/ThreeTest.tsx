import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";

import * as THREE from "three";

import styles from "./ThreeTest.module.scss";
import { WebGLRenderer } from "three";

export function ThreeTest() {
  return (
    <div
      style={{ width: "100%", height: "30rem" }}
      className={styles.ThreeTest}
    >
      <Canvas
        camera={{ position: [0, 0, 2] }}
        onCreated={({ gl }) => {
          // gl.toneMapping = THREE.ACESFilmicToneMapping;
          // gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
