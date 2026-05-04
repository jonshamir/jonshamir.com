// src/app/lab/campfire/CampfireCanvas.tsx
"use client";

import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Color } from "three";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { TweakpanePanel } from "../../../components/TweakpanePanel";
import { folder, getPane, useControls } from "../../../lib/tweakpane";
import { LogMesh } from "./rendering/LogMesh";
import { useLogSimulation } from "./rendering/useLogSimulation";

export default function CampfireCanvas() {
  const display = useControls("Display", {
    backgroundColor: { value: "#1a1410", label: "Background" },
    showHeatmap: { value: false, label: "Heat-map" },
    showSegmentIndices: { value: false, label: "Indices" },
    showWireframe: { value: false, label: "Wireframe" }
  });

  const log = useControls("Log", {
    length: {
      value: 0.3,
      min: 0.05,
      max: 0.5,
      step: 0.005,
      label: "Length (m)"
    },
    radius: {
      value: 0.025,
      min: 0.003,
      max: 0.05,
      step: 0.001,
      label: "Radius (m)"
    },
    segmentCount: { value: 20, min: 5, max: 40, step: 1, label: "Segments" },
    surfaceRes: folder(
      {
        surfaceWidth: {
          value: 32,
          min: 16,
          max: 128,
          step: 16,
          label: "Tex U"
        },
        surfaceHeight: {
          value: 256,
          min: 64,
          max: 512,
          step: 32,
          label: "Tex V"
        }
      },
      { collapsed: true }
    )
  });

  const sim = useLogSimulation({
    length: log.length as number,
    radius: log.radius as number,
    segmentCount: log.segmentCount as number,
    surfaceWidth: log.surfaceWidth as number,
    surfaceHeight: log.surfaceHeight as number
  });

  // `sim` gets a new identity every animation frame (useLogSimulation calls
  // setTick per frame). Read it through a ref so the buttons effect stays
  // mounted across frames — otherwise the Actions folder would be disposed
  // and recreated ~60x/sec, swallowing clicks.
  const simRef = useRef(sim);
  simRef.current = sim;

  // Action buttons via raw Tweakpane API (useControls has no button binding).
  useEffect(() => {
    const pane = getPane();
    const folderApi = pane.addFolder({ title: "Actions", expanded: true });
    const igniteBtn = folderApi.addButton({ title: "Ignite end" });
    const resetBtn = folderApi.addButton({ title: "Reset" });
    const params = { K: 0 };
    const kBinding = folderApi.addBinding(params, "K", {
      min: 0,
      max: (log.segmentCount as number) - 1,
      step: 1,
      label: "Debug ignite K"
    });
    const igniteKBtn = folderApi.addButton({ title: "Ignite at K" });

    const subs = [
      igniteBtn.on("click", () => simRef.current.igniteEnd()),
      resetBtn.on("click", () => simRef.current.reset()),
      igniteKBtn.on("click", () => simRef.current.igniteAtSegment(params.K))
    ];

    return () => {
      for (const s of subs) s.dispose?.();
      kBinding.dispose();
      folderApi.dispose();
    };
  }, [log.segmentCount]);

  const bg = new Color(display.backgroundColor as string);

  return (
    <>
      <TweakpanePanel />
      <ThreeCanvas
        camera={{ fov: 50, position: [0, 0.4, 1.2], near: 0.01, far: 100 }}
        isFullscreen={true}
      >
        <color attach="background" args={[bg.r, bg.g, bg.b]} />
        <OrbitControls makeDefault />
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />
        <LogMesh
          log={sim.log}
          showHeatmap={display.showHeatmap as boolean}
          showSegmentIndices={display.showSegmentIndices as boolean}
          showWireframe={display.showWireframe as boolean}
        />
      </ThreeCanvas>
    </>
  );
}
