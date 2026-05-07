"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Color } from "three";

import { ThreeCanvas } from "../../../../components/ThreeCanvas/ThreeCanvas";
import { mapFocus } from "../../point-cloud/focusMapping";
import { SparkRendererMount } from "../../point-cloud/SparkRendererMount";
import { SplatViewer } from "../../point-cloud/SplatViewer";
import styles from "./ImagineScene.module.css";

const BG = "#000000";
const NOISE_FREQ = 0.18;
const NOISE_SPEED = 0.01;
const NOISE_RISE = 0.04;
const MAX_SIZE = 0.8;

const FOCUS_BLURRY = 0.15;
const FOCUS_CLEAR = 1.0;
const DRIFT_AMP = 0.05;
const DRIFT_PERIOD_S = 6;
const SOLIDIFY_DURATION_S = 1.6;

type Mode = "drift" | "solidify" | "static";

function FocusDriver({
  phaseId,
  onSolidifyDone,
  onValueChange
}: {
  phaseId: string;
  onSolidifyDone: () => void;
  onValueChange: (v: number) => void;
}) {
  const focus = useRef(FOCUS_BLURRY);
  const mode = useRef<Mode>("drift");
  const solidifyStart = useRef(0);
  const driftBase = useRef(FOCUS_BLURRY);
  const tElapsed = useRef(0);
  const announcedDone = useRef(false);

  useEffect(() => {
    announcedDone.current = false;
    if (phaseId === "awaitingConfirm" || phaseId === "imagining") {
      mode.current = "drift";
      driftBase.current = FOCUS_BLURRY;
    } else if (phaseId === "solidifying") {
      mode.current = "solidify";
      solidifyStart.current = tElapsed.current;
    } else if (phaseId === "awaitingSend" || phaseId === "warning") {
      mode.current = "static";
      focus.current = FOCUS_CLEAR;
    }
  }, [phaseId]);

  useFrame((_, delta) => {
    tElapsed.current += delta;
    if (mode.current === "drift") {
      const t = tElapsed.current;
      focus.current =
        driftBase.current +
        Math.sin((t / DRIFT_PERIOD_S) * Math.PI * 2) * DRIFT_AMP;
    } else if (mode.current === "solidify") {
      const elapsed = tElapsed.current - solidifyStart.current;
      const p = Math.min(elapsed / SOLIDIFY_DURATION_S, 1);
      const eased = 1 - Math.pow(1 - p, 3); // cubic ease-out
      const start = FOCUS_BLURRY;
      focus.current = start + (FOCUS_CLEAR - start) * eased;
      if (p >= 1 && !announcedDone.current) {
        announcedDone.current = true;
        mode.current = "static";
        focus.current = FOCUS_CLEAR;
        onSolidifyDone();
      }
    }
    onValueChange(focus.current);
  });

  return null;
}

function SceneInner({
  url,
  phaseId,
  onSolidifyDone
}: {
  url: string;
  phaseId: string;
  onSolidifyDone: () => void;
}) {
  const [params, setParams] = useState(() => mapFocus(FOCUS_BLURRY));
  return (
    <>
      <FocusDriver
        phaseId={phaseId}
        onSolidifyDone={onSolidifyDone}
        onValueChange={(v) => setParams(mapFocus(v))}
      />
      <SparkRendererMount />
      <SplatViewer
        url={url}
        sizeScale={params.sizeScale}
        noiseAmp={params.noiseAmp}
        noiseFreq={NOISE_FREQ}
        noiseSpeed={NOISE_SPEED}
        noiseRise={NOISE_RISE}
        shapeStrength={params.shapeStrength}
        sizeUniformity={params.sizeUniformity}
        maxSize={MAX_SIZE}
        dissolve={params.dissolve}
        applyModifier={true}
        flipY={true}
      />
    </>
  );
}

export default function ImagineScene({
  sceneAsset,
  phaseId,
  onAdvance
}: {
  sceneAsset: string;
  phaseId: string;
  onAdvance: () => void;
}) {
  const bg = new Color(BG);
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ThreeCanvas
        className={styles.scene}
        camera={{ fov: 60, position: [0, 0, 6], near: 0.01, far: 1000 }}
        isFullscreen={false}
        grabCursor={false}
      >
        <color attach="background" args={[bg.r, bg.g, bg.b]} />
        <OrbitControls
          makeDefault
          autoRotate
          autoRotateSpeed={0.6}
          enableRotate={false}
          enableZoom={false}
          enablePan={false}
        />
        <SceneInner
          url={sceneAsset}
          phaseId={phaseId}
          onSolidifyDone={onAdvance}
        />
      </ThreeCanvas>
    </div>
  );
}
