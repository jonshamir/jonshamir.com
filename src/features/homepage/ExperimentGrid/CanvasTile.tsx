"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { useIntersectionObserver, useMediaQuery } from "usehooks-ts";

import styles from "./ExperimentGrid.module.css";
import { CanvasSceneId } from "./experiments";

const SdfCollisionCanvas = dynamic(
  () => import("../../../app/lab/sdf-collision/SdfCollisionCanvas"),
  { ssr: false }
);
const CratersCanvas = dynamic(
  () => import("../../../app/lab/craters/CratersCanvas"),
  { ssr: false }
);

const SCENES: Record<CanvasSceneId, ComponentType> = {
  "sdf-collision": function SdfCollisionTile() {
    return <SdfCollisionCanvas controls={false} isFullscreen={false} />;
  },
  craters: CratersCanvas
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
    <div ref={ref} className={styles.canvasHolder}>
      {isIntersecting && !reducedMotion && <Scene />}
    </div>
  );
}
