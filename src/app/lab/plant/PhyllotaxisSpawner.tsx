import { ReactElement } from "react";
import { Color, Euler } from "three";

import { pseudoRandom, range, saturate } from "./utils";

const { pow } = Math;

export interface SpawnedElementProps {
  index: number;
  age: number;
  growingStage: number;
  dyingStage: number;
  position: [number, number, number];
  rotation: Euler;
  baseColor?: Color;
  shadowColor?: Color;
  subsurfaceColor?: Color;
}

interface PhyllotaxisSpawnerProps {
  count: number;
  matureAge: number;
  baseYaw: number;
  basePitch: number;
  layerHeight: number;
  baseColor?: Color;
  shadowColor?: Color;
  subsurfaceColor?: Color;
  position?: [number, number, number];
  rotation?: Euler;
  renderElement: (props: SpawnedElementProps) => ReactElement;
}

export function PhyllotaxisSpawner({
  count: n,
  matureAge,
  baseYaw,
  basePitch,
  layerHeight,
  baseColor,
  shadowColor,
  subsurfaceColor,
  renderElement,
  ...groupProps
}: PhyllotaxisSpawnerProps) {
  return (
    <group {...groupProps}>
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
        const y = Math.pow(growingStage, 0.3) * i * layerHeight;

        return renderElement({
          index: i,
          age,
          growingStage,
          dyingStage,
          position: [0, y, 0],
          rotation,
          baseColor,
          shadowColor,
          subsurfaceColor
        });
      })}
    </group>
  );
}
