"use client";

import { OrbitControls } from "@react-three/drei";
import { useMemo, useState } from "react";
import { Color } from "three";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { TweakpanePanel } from "../../../components/TweakpanePanel";
import { useControls } from "../../../lib/tweakpane";
import { FocusControl } from "./FocusControl";
import { mapFocus } from "./focusMapping";
import { SparkRendererMount } from "./SparkRendererMount";
import { SplatViewer } from "./SplatViewer";

// Files placed in /public/lab/point-cloud/. Add new ones here as
// `Display Name`: `/path/to/file.ext` — Tweakpane's list binding uses the
// keys as labels and the values as the bound state.
const FILES: Record<string, string> = {
  "Bonsai Tree": "/lab/point-cloud/Bonsai Tree.sog",
  DeLonghi: "/lab/point-cloud/DeLonghi.sog",
  Windmill: "/lab/point-cloud/Windmill.sog"
};

const DEFAULT_URL = Object.values(FILES)[0] ?? "";

export default function PointCloudCanvas() {
  const { file } = useControls("File", {
    file: { value: DEFAULT_URL, options: FILES, label: "Source" }
  }) as { file: string };

  const { backgroundColor, applyModifier, flipY } = useControls("Display", {
    backgroundColor: { value: "#1e1e1e", label: "Background" },
    applyModifier: { value: true, label: "Apply Modifier" },
    flipY: { value: true, label: "Flip Y" }
  }) as {
    backgroundColor: string;
    applyModifier: boolean;
    flipY: boolean;
  };

  const { rotationSpeed } = useControls("Camera", {
    rotationSpeed: {
      value: 1.5,
      min: 0.0,
      max: 4.0,
      step: 0.1,
      label: "Rotation Speed"
    }
  }) as { rotationSpeed: number };

  const { noiseFreq, noiseSpeed, noiseRise, maxSize } = useControls(
    "Distortion",
    {
      noiseFreq: {
        value: 0.18,
        min: 0.01,
        max: 1.0,
        step: 0.01,
        label: "Noise Frequency"
      },
      noiseSpeed: {
        value: 0.01,
        min: 0.0,
        max: 0.1,
        step: 0.005,
        label: "Noise Speed"
      },
      noiseRise: {
        value: 0.04,
        min: 0.0,
        max: 0.1,
        step: 0.005,
        label: "Noise Rise"
      },
      maxSize: {
        value: 0.5,
        min: 0.001,
        max: 1.0,
        step: 0.001,
        label: "Max Splat Size"
      }
    },
    { collapsed: false }
  ) as {
    noiseFreq: number;
    noiseSpeed: number;
    noiseRise: number;
    maxSize: number;
  };

  const [focus, setFocus] = useState(1.0);

  const focusParams = useMemo(() => mapFocus(focus), [focus]);

  const url = file;
  const bg = new Color(backgroundColor);

  return (
    <>
      <TweakpanePanel />
      <FocusControl focus={focus} onFocusChange={setFocus} />
      <ThreeCanvas
        camera={{ fov: 50, position: [0, 0, 4], near: 0.01, far: 1000 }}
        isFullscreen={true}
      >
        <color attach="background" args={[bg.r, bg.g, bg.b]} />
        <OrbitControls
          makeDefault
          autoRotate={rotationSpeed > 0}
          autoRotateSpeed={rotationSpeed}
        />
        <SparkRendererMount />
        {url && (
          <SplatViewer
            url={url}
            sizeScale={focusParams.sizeScale}
            noiseAmp={focusParams.noiseAmp}
            noiseFreq={noiseFreq}
            noiseSpeed={noiseSpeed}
            noiseRise={noiseRise}
            shapeStrength={focusParams.shapeStrength}
            sizeUniformity={focusParams.sizeUniformity}
            maxSize={maxSize}
            dissolve={focusParams.dissolve}
            applyModifier={applyModifier}
            flipY={flipY}
          />
        )}
      </ThreeCanvas>
    </>
  );
}
