import { OrbitControls } from "@react-three/drei";
import { BaseMesh, ProjectionMapping } from "./ProjectionMapping";
import { useState } from "react";
import { ThreeCanvas } from "../../components/ThreeCanvas/ThreeCanvas";

import styles from "./EarthCanvas.module.scss";

function MeshSelect({
  value,
  onChange,
}: {
  value: BaseMesh;
  onChange: (value: BaseMesh) => void;
}) {
  return (
    <div className={styles.MeshSelect}>
      {Object.values(BaseMesh).map((key) => (
        <img
          key={key}
          alt={key}
          src={`/models/${key}.svg`}
          onClick={() => onChange(key as BaseMesh)}
          className={value === key ? styles.selected : ""}
        />
      ))}
    </div>
  );
}

export function EarthCanvas() {
  const [baseMesh, setBaseMesh] = useState<BaseMesh>(BaseMesh.Icosahedron);
  return (
    <>
      <div style={{ width: "100%" }}>
        <MeshSelect value={baseMesh} onChange={setBaseMesh} />
        <ThreeCanvas camera={{ position: [0, 0, 10], zoom: 3.5 }}>
          <OrbitControls enablePan={false} enableZoom={false} />
          <ProjectionMapping baseMesh={baseMesh} />
        </ThreeCanvas>
      </div>
    </>
  );
}
