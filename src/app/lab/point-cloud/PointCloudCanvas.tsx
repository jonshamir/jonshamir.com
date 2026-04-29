"use client";

import { OrbitControls } from "@react-three/drei";
import { Color } from "three";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { TweakpanePanel } from "../../../components/TweakpanePanel";
import { useControls } from "../../../lib/tweakpane";
import { SparkRendererMount } from "./SparkRendererMount";
import { SplatViewer } from "./SplatViewer";

// Files placed in /public/lab/point-cloud/. Add new ones here as
// `Display Name`: `/path/to/file.ext` — Tweakpane's list binding uses the
// keys as labels and the values as the bound state.
const FILES: Record<string, string> = {
  "Bonsai Tree": "/lab/point-cloud/Bonsai Tree.sog"
};

const DEFAULT_URL = Object.values(FILES)[0] ?? "";

export default function PointCloudCanvas() {
  const { file } = useControls("File", {
    file: { value: DEFAULT_URL, options: FILES, label: "Source" }
  }) as { file: string };

  const { sizeScale, backgroundColor, applyModifier, flipY } = useControls(
    "Display",
    {
      sizeScale: {
        value: 1.0,
        min: 0.1,
        max: 3.0,
        step: 0.05,
        label: "Splat Size"
      },
      backgroundColor: { value: "#1e1e1e", label: "Background" },
      applyModifier: { value: true, label: "Apply Modifier" },
      flipY: { value: true, label: "Flip Y" }
    }
  ) as {
    sizeScale: number;
    backgroundColor: string;
    applyModifier: boolean;
    flipY: boolean;
  };

  const { noiseAmp, noiseFreq, noiseSpeed } = useControls(
    "Distortion",
    {
      noiseAmp: {
        value: 2.0,
        min: 0.0,
        max: 20.0,
        step: 0.01,
        label: "Noise Amount"
      },
      noiseFreq: {
        value: 0.2,
        min: 0.01,
        max: 3.0,
        step: 0.1,
        label: "Noise Frequency"
      },
      noiseSpeed: {
        value: 0.05,
        min: 0.0,
        max: 0.1,
        step: 0.05,
        label: "Noise Speed"
      }
    },
    { collapsed: false }
  ) as { noiseAmp: number; noiseFreq: number; noiseSpeed: number };

  const url = file;
  const bg = new Color(backgroundColor);

  return (
    <>
      <TweakpanePanel />
      <ThreeCanvas
        camera={{ fov: 50, position: [0, 0, 4], near: 0.01, far: 1000 }}
        isFullscreen={true}
      >
        <color attach="background" args={[bg.r, bg.g, bg.b]} />
        <OrbitControls makeDefault />
        <SparkRendererMount />
        {url && (
          <SplatViewer
            url={url}
            sizeScale={sizeScale}
            noiseAmp={noiseAmp}
            noiseFreq={noiseFreq}
            noiseSpeed={noiseSpeed}
            applyModifier={applyModifier}
            flipY={flipY}
          />
        )}
      </ThreeCanvas>
    </>
  );
}
