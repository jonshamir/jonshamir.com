"use client";

import { useEffect, useState } from "react";

import { SdfCollisionQuad } from "../../../app/lab/sdf-collision/SdfCollisionQuad";
import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import styles from "./HeroBackground.module.css";

export function HeroBackground() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const brightness = isDark ? 0.9 : 1.1;

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
        brightness={brightness}
      />
    </ThreeCanvas>
  );
}
