import { Canvas } from "@react-three/fiber";

import styles from "./ThreeTest.module.scss";
import { OrbitControls } from "@react-three/drei";
import { BaseMesh, ProjectionMapping } from "./ProjectionMapping";
import { useState } from "react";

function ShapeSelect({
  value,
  onChange,
}: {
  value: BaseMesh;
  onChange: (value: BaseMesh) => void;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="icosahedron">Icosahedron</option>
      <option value="sphere">Sphere</option>
      <option value="cube">Cube</option>
      <option value="dodecahedron">Dodecahedron</option>
      <option value="torus">Torus</option>
      <option value="octahedron">Octahedron</option>
    </select>
  );
}

export function ThreeTest() {
  const [baseMesh, setBaseMesh] = useState<BaseMesh>(BaseMesh.Icosahedron);
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
      <ShapeSelect value={baseMesh} onChange={setBaseMesh} />
    </>
  );
}
