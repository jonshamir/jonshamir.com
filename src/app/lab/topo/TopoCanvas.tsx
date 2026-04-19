"use client";

import { folder, useControls } from "leva";
import { useEffect, useMemo, useState } from "react";

import { LevaPanel } from "../../../components/LevaPanel";
import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { HeightmapQuad } from "./HeightmapQuad";
import { TerrainMesh } from "./TerrainMesh";
import styles from "./TopoCanvas.module.css";
import { createTopoUniforms, syncLevaToUniforms } from "./uniforms";

type View = "3d" | "2d";

export default function TopoCanvas() {
  const [view, setView] = useState<View>("3d");
  const uniforms = useMemo(() => createTopoUniforms(), []);

  const controls = useControls({
    base: folder({
      baseAmplitude: {
        value: 0.3,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Amplitude"
      },
      baseFrequency: {
        value: 2.0,
        min: 0.1,
        max: 20,
        step: 0.1,
        label: "Frequency"
      },
      baseOctaves: { value: 5, min: 1, max: 8, step: 1, label: "Octaves" }
    }),
    rendering: folder({
      displacementScale: {
        value: 1.0,
        min: 0,
        max: 3,
        step: 0.05,
        label: "Displacement"
      }
    })
  });

  useEffect(() => {
    syncLevaToUniforms(controls, uniforms);
  }, [controls, uniforms]);

  return (
    <>
      <LevaPanel />
      <div className={styles.wrapper}>
        <button
          className={styles.toggle}
          onClick={() => setView((v) => (v === "3d" ? "2d" : "3d"))}
          type="button"
        >
          View: {view.toUpperCase()}
        </button>
        <ThreeCanvas
          className="grid-full"
          style={{ backgroundColor: "#f5f5f5", height: "40rem" }}
          camera={{ position: [1.2, 1.2, 1.2], fov: 35 }}
        >
          <color attach="background" args={["#f5f5f5"]} />
          {view === "3d" && <TerrainMesh uniforms={uniforms} />}
          {view === "2d" && <HeightmapQuad uniforms={uniforms} />}
        </ThreeCanvas>
      </div>
    </>
  );
}
