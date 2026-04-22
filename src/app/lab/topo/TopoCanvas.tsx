"use client";

import { useEffect, useMemo } from "react";

import { TweakpanePanel } from "../../../components/TweakpanePanel";
import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { useControls } from "../../../lib/tweakpane";
import { TerrainMesh } from "./TerrainMesh";
import {
  buildControlsSchema,
  createTopoUniforms,
  syncControlsToUniforms,
  type TopoControls
} from "./uniforms";

export default function TopoCanvas() {
  const uniforms = useMemo(() => createTopoUniforms(), []);

  const schema = useMemo(() => buildControlsSchema(), []);
  const controls = useControls(schema);

  useEffect(() => {
    syncControlsToUniforms(controls as unknown as TopoControls, uniforms);
  }, [controls, uniforms]);

  return (
    <>
      <TweakpanePanel />
      <ThreeCanvas isFullscreen={true}>
        <TerrainMesh uniforms={uniforms} />
      </ThreeCanvas>
    </>
  );
}
