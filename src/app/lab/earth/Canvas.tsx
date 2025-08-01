"use client";

import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, Noise } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import { useState } from "react";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import styles from "./EarthCanvas.module.scss";
import { BaseMesh, ProjectionMapping } from "./ProjectionMapping";

function MeshSelect({
  value,
  onChange
}: {
  value: BaseMesh;
  onChange: (value: BaseMesh) => void;
}) {
  return (
    <div className={styles.MeshSelect}>
      {Object.values(BaseMesh).map((key) => (
        <button
          key={key}
          onClick={() => onChange(key as BaseMesh)}
          className={value === key ? styles.selected : ""}
        >
          <img alt={key} src={`/models/${key}.svg`} />
        </button>
      ))}
    </div>
  );
}

export default function Earth() {
  const [baseMesh, setBaseMesh] = useState<BaseMesh>(BaseMesh.Icosahedron);
  const postProcessing = true;
  return (
    <>
      <MeshSelect value={baseMesh} onChange={setBaseMesh} />
      <ThreeCanvas
        className="full-bleed"
        camera={{ position: [0, 0, 10], zoom: 3.5 }}
        style={{ backgroundColor: "#101010" }}
      >
        <OrbitControls enablePan={false} enableZoom={false} />
        <ProjectionMapping baseMesh={baseMesh} />
        <EffectComposer>
          {postProcessing ? (
            <>
              <Bloom
                intensity={0.3}
                luminanceThreshold={0.1}
                kernelSize={KernelSize.LARGE}
                radius={0.3}
                levels={5}
              />
              <Noise opacity={0.05} />
            </>
          ) : (
            <Noise opacity={0} />
          )}
        </EffectComposer>
      </ThreeCanvas>
    </>
  );
}
