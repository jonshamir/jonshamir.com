"use client";

import { useControls } from "leva";
import { useEffect, useMemo, useState } from "react";

import { LevaPanel } from "../../../components/LevaPanel";
import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { HeightmapQuad } from "./HeightmapQuad";
import { TerrainMesh } from "./TerrainMesh";
import styles from "./TopoCanvas.module.css";
import {
  buildLevaSchema,
  createTopoUniforms,
  syncLevaToUniforms,
  type TopoControls
} from "./uniforms";

type View = "3d" | "2d";

export default function TopoCanvas() {
  const [view, setView] = useState<View>("3d");
  const uniforms = useMemo(() => createTopoUniforms(), []);

  const levaSchema = useMemo(() => buildLevaSchema(), []);
  const controls = useControls(levaSchema);

  useEffect(() => {
    syncLevaToUniforms(controls as unknown as TopoControls, uniforms);
  }, [controls, uniforms]);

  return (
    <>
      <LevaPanel />
      <button
        className={styles.toggle}
        onClick={() => setView((v) => (v === "3d" ? "2d" : "3d"))}
        type="button"
      >
        View: {view.toUpperCase()}
      </button>
      <ThreeCanvas isFullscreen={true}>
        {view === "3d" && <TerrainMesh uniforms={uniforms} />}
        {view === "2d" && <HeightmapQuad uniforms={uniforms} />}
      </ThreeCanvas>
    </>
  );
}
