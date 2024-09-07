import { useControls } from "leva";
import { Euler } from "three";

import { CustomLeaf } from "./CustomLeaf";
import { pseudoRandom, range, saturate } from "./utils";
const { pow } = Math;

const GOLDEN_ANGLE = 2.39996;

interface PlantProps {
  age: number;
  position?: [number, number, number];
  rotation?: Euler;
}

export function Plant({ age: n, ...props }: PlantProps) {
  const { matureAge, basePitch, baseYaw, layerHeight } = useControls("Plant ", {
    matureAge: { value: 50, min: 1, max: 300, step: 1 },
    basePitch: { value: -1.55, min: -Math.PI, max: Math.PI },
    baseYaw: { value: GOLDEN_ANGLE, min: 0, max: Math.PI },
    layerHeight: { value: 0.02, min: 0, max: 0.2 }
  });
  return (
    <group {...props}>
      {range(0, n).map((i) => {
        const age = saturate((n - i) / matureAge); // 0 = new, 1 = mature
        const dyingStage = pow(saturate((age - 0.5) * 2), 3); // 0 = not dying, 1 = dead
        const growingStage = pow(saturate(age * 2), 0.3); // 0 = new, 1 = fully grown

        // rotation
        const rand = pseudoRandom(i);
        const yaw = baseYaw * i + 0.02 * n + rand * 0.1;
        const pitch = basePitch - 2.3 * age - 1 * dyingStage;
        const rotation = new Euler(pitch, yaw, 0);
        rotation.order = "YXZ";

        // position
        // const y = -(age * layerHeight);
        // const y = (i - n) * layerHeight;
        const y = Math.pow(growingStage, 0.3) * i * layerHeight;

        return (
          <CustomLeaf
            key={i}
            growingStage={growingStage}
            dyingStage={dyingStage}
            position={[0, y, 0]}
            rotation={rotation}
          />
        );
      })}
    </group>
  );
}
