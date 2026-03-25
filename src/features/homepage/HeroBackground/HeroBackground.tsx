"use client";

import { SdfCollisionQuad } from "../../../app/lab/sdf-collision/SdfCollisionQuad";
import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import styles from "./HeroBackground.module.css";

export function HeroBackground() {
  return (
    <ThreeCanvas
      isFullscreen={false}
      grabCursor={false}
      gl={{ alpha: true }}
      className={styles.heroBackground}
    >
      <SdfCollisionQuad
        gravity={0}
        blendFactor={0.12}
        restitution={0.6}
        damping={1.0}
        shapeCount={12}
        centerGravity={true}
        noiseAmount={0.05}
        useWindowEvents={true}
        gravityCenter={[0.66, 0.5]}
        brightness={1}
      />
    </ThreeCanvas>
  );
}
