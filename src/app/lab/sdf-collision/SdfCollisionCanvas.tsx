import { Leva, useControls } from "leva";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { SdfCollisionQuad } from "./SdfCollisionQuad";

export default function SdfCollisionCanvas() {
  const controls = useControls({
    gravity: { value: 4, min: 0, max: 10, label: "Gravity" },
    mouseStrength: { value: 8, min: 0, max: 20, label: "Mouse Strength" },
    blendFactor: { value: 0.2, min: 0, max: 2, step: 0.05, label: "Blend" },
    restitution: { value: 0.6, min: 0, max: 1, step: 0.05, label: "Bounce" },
    shapeCount: { value: 8, min: 1, max: 16, step: 1, label: "Shapes" }
  });

  return (
    <>
      <Leva />
      <ThreeCanvas isFullscreen={true} style={{ backgroundColor: "#0f0f0f" }}>
        <SdfCollisionQuad
          gravity={controls.gravity}
          mouseStrength={controls.mouseStrength}
          blendFactor={controls.blendFactor}
          restitution={controls.restitution}
          shapeCount={controls.shapeCount}
        />
      </ThreeCanvas>
    </>
  );
}
