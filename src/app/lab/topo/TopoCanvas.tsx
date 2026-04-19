"use client";

import { useState } from "react";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import styles from "./TopoCanvas.module.css";

type View = "3d" | "2d";

export default function TopoCanvas() {
  const [view, setView] = useState<View>("3d");

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
        {/* TerrainMesh / HeightmapQuad go here in later tasks */}
      </ThreeCanvas>
    </div>
  );
}
