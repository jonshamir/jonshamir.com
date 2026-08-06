"use client";

import { SdfCollisionQuad } from "../../../../app/lab/sdf-collision/SdfCollisionQuad";
import { ThreeCanvas } from "../../../../components/ThreeCanvas/ThreeCanvas";
import styles from "../ExperimentGrid.module.css";

export function SdfCollisionScene() {
  return (
    <ThreeCanvas
      isFullscreen={false}
      grabCursor={false}
      gl={{ alpha: true }}
      className={styles.canvasFill}
    >
      <SdfCollisionQuad
        gravity={0}
        blendFactor={0.12}
        restitution={0.6}
        damping={1.0}
        shapeCount={8}
        centerGravity={true}
        noiseAmount={0.05}
        useWindowEvents={false}
        gravityCenter={[0.5, 0.5]}
      />
    </ThreeCanvas>
  );
}
