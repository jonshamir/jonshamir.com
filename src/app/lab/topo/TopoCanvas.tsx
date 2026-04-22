"use client";

import { useControls } from "leva";
import { useEffect, useMemo } from "react";

import { LevaPanel } from "../../../components/LevaPanel";
import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { TerrainMesh } from "./TerrainMesh";
import {
  buildLevaSchema,
  createTopoUniforms,
  syncLevaToUniforms,
  type TopoControls
} from "./uniforms";

export default function TopoCanvas() {
  const uniforms = useMemo(() => createTopoUniforms(), []);

  const levaSchema = useMemo(() => buildLevaSchema(), []);
  const controls = useControls(levaSchema);

  useEffect(() => {
    syncLevaToUniforms(controls as unknown as TopoControls, uniforms);
  }, [controls, uniforms]);

  return (
    <>
      <LevaPanel />
      <ThreeCanvas isFullscreen={true}>
        <TerrainMesh uniforms={uniforms} />
      </ThreeCanvas>
    </>
  );
}
