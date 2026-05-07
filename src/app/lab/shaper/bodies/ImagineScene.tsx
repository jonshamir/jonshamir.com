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

const SHAPE_KEYFRAMES: ReadonlyArray<{ t: number; v: number }> = [
  { t: 0, v: 0 },
  { t: 2.33, v: 0.6 },
  { t: 4.67, v: 0.3 },
  { t: 7.0, v: 0.9 }
];
const SHAPE_END_T = 7.0;
const SHAPE_FINAL_V = 0.94;

function shapeAt(elapsed: number): number {
  if (elapsed <= 0) return SHAPE_KEYFRAMES[0].v;
  if (elapsed >= SHAPE_END_T) return SHAPE_FINAL_V;
  for (let i = 1; i < SHAPE_KEYFRAMES.length; i++) {
    const a = SHAPE_KEYFRAMES[i - 1];
    const b = SHAPE_KEYFRAMES[i];
    if (elapsed <= b.t) {
      const p = (elapsed - a.t) / (b.t - a.t);
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * p); // smoothstep
      return a.v + (b.v - a.v) * eased;
    }
  }
  return SHAPE_FINAL_V;
}

type Mode = "static" | "shaping";

function FocusDriver({
  phaseId,
  onSolidifyDone,
  onValueChange
}: {
  phaseId: string;
  onSolidifyDone: () => void;
  onValueChange: (v: number) => void;
}) {
  const focus = useRef(0);
  const mode = useRef<Mode>("static");
  const shapeStart = useRef(0);
  const tElapsed = useRef(0);
  const announcedDone = useRef(false);

  useEffect(() => {
    announcedDone.current = false;
    if (phaseId === "solidifying") {
      mode.current = "shaping";
      shapeStart.current = tElapsed.current;
    } else if (phaseId === "awaitingSend" || phaseId === "warning") {
      mode.current = "static";
      focus.current = SHAPE_FINAL_V;
    } else {
      // "awaitingConfirm" or anything else — scene is hidden, hold at 0
      mode.current = "static";
      focus.current = 0;
    }
  }, [phaseId]);

  useFrame((_, delta) => {
    tElapsed.current += delta;
    if (mode.current === "shaping") {
      const elapsed = tElapsed.current - shapeStart.current;
      focus.current = shapeAt(elapsed);
      if (elapsed >= SHAPE_END_T && !announcedDone.current) {
        announcedDone.current = true;
        mode.current = "static";
        focus.current = SHAPE_FINAL_V;
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
  const [params, setParams] = useState(() => mapFocus(0));
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
