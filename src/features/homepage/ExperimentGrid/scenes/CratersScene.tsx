"use client";

import { OrbitControls } from "@react-three/drei";

import { MoonCraters } from "../../../../app/lab/craters/MoonCraters";
import {
  CANVAS_BG,
  ThreeCanvas
} from "../../../../components/ThreeCanvas/ThreeCanvas";
import styles from "../ExperimentGrid.module.css";

export function CratersScene() {
  return (
    <ThreeCanvas
      camera={{ position: [0, 0, 10], zoom: 6 }}
      style={{ backgroundColor: CANVAS_BG }}
      className={styles.canvasFill}
    >
      <OrbitControls enablePan={false} enableZoom={false} />
      <MoonCraters />
    </ThreeCanvas>
  );
}
