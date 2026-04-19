"use client";

import { useMemo, useState } from "react";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { TerrainMesh } from "./TerrainMesh";
import styles from "./TopoCanvas.module.css";
import { createTopoUniforms } from "./uniforms";

type View = "3d" | "2d";

export default function TopoCanvas() {
  const [view, setView] = useState<View>("3d");
  const uniforms = useMemo(() => createTopoUniforms(), []);

  return (
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
        {/* 2D view added in Task 4 */}
      </ThreeCanvas>
    </div>
  );
}
