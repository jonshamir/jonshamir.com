"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { useIntersectionObserver, useMediaQuery } from "usehooks-ts";

import styles from "./ExperimentGrid.module.css";
import { CanvasSceneId } from "./experiments";

const SCENES: Record<CanvasSceneId, ComponentType> = {
  "sdf-collision": dynamic(
    () => import("./scenes/SdfCollisionScene").then((m) => m.SdfCollisionScene),
    { ssr: false }
  ),
  craters: dynamic(
    () => import("./scenes/CratersScene").then((m) => m.CratersScene),
    { ssr: false }
  )
};

/* Literal CANVAS_BG: importing it from ThreeCanvas.tsx would pull r3f into the
   page bundle and defeat the dynamic() split above */
const SCENE_BG: Record<CanvasSceneId, string | undefined> = {
  "sdf-collision": undefined,
  craters: "#101010"
};

export function CanvasTile({ scene }: { scene: CanvasSceneId }) {
  const { isIntersecting, ref } = useIntersectionObserver({
    rootMargin: "150% 0% 150% 0%",
    threshold: 0
  });
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", {
    initializeWithValue: false
  });
  const Scene = SCENES[scene];

  return (
    <div
      ref={ref}
      className={styles.canvasHolder}
      style={{ backgroundColor: SCENE_BG[scene] }}
    >
      {isIntersecting && !reducedMotion && <Scene />}
    </div>
  );
}
