import { useControls } from "leva";

import { LevaPanel } from "../../../components/LevaPanel";
import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { MAX_SHAPES } from "./constants";
import { SdfCollisionQuad } from "./SdfCollisionQuad";

export default function SdfCollisionCanvas() {
  const controls = useControls({
    gravity: { value: 0, min: 0, max: 10, label: "Gravity" },
    blendFactor: { value: 0.12, min: 0, max: 2, step: 0.05, label: "Blend" },
    restitution: { value: 0.6, min: 0, max: 1, step: 0.05, label: "Bounce" },
    damping: { value: 1.0, min: 0, max: 2, step: 0.05, label: "Damping" },
    shapeCount: {
      value: 12,
      min: 1,
      max: MAX_SHAPES,
      step: 1,
      label: "Shapes"
    },
    centerGravity: { value: true, label: "Center Gravity" },
    noiseAmount: { value: 0.05, min: 0, max: 0.3, step: 0.005, label: "Noise" }
  });

  return (
    <>
      <LevaPanel />
      <ThreeCanvas isFullscreen={true} grabCursor={false} gl={{ alpha: true }}>
        <SdfCollisionQuad
          gravity={controls.gravity}
          blendFactor={controls.blendFactor}
          restitution={controls.restitution}
          damping={controls.damping}
          shapeCount={controls.shapeCount}
          centerGravity={controls.centerGravity}
          noiseAmount={controls.noiseAmount}
        />
      </ThreeCanvas>
    </>
  );
}
