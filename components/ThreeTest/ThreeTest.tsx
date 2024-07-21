import { Canvas } from "@react-three/fiber";

import { Scene } from "./Scene";

import styles from "./ThreeTest.module.scss";
import { OrbitControls } from "@react-three/drei";
import { BaseMesh, ProjectionMapping } from "./ProjectionMapping";
import { useState } from "react";

export function ThreeTest() {
  const [baseMesh, setBaseMesh] = useState<BaseMesh>("icosahedron");
  return (
    <>
      <div
        style={{ width: "100%", height: "30rem" }}
        className={styles.ThreeTest}
      >
        <Canvas camera={{ position: [0, 0, 10], zoom: 4 }}>
          <OrbitControls enablePan={false} enableZoom={false} />
          <ProjectionMapping baseMesh={baseMesh} />
        </Canvas>
      </div>
      <select value={baseMesh} onChange={(e) => setBaseMesh(e.target.value)}>
        <option value="icosahedron">Icosahedron</option>
        <option value="sphere">Sphere</option>
        <option value="cube">Cube</option>
        <option value="dodecahedron">Dodecahedron</option>
        <option value="torus">Torus</option>
      </select>
    </>
  );
}
