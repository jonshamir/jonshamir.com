import { ReactElement } from "react";
import { Color, Curve, Euler, Vector3 } from "three";

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
  curve?: Curve<Vector3>; // Optional curve to position elements along
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
  curve,
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
        let position: [number, number, number];
        if (curve) {
          // Position along the curve based on arc length (distance along curve)
          // Start from the end of the curve (t=1) and go backwards
          const distance =
            Math.pow(growingStage, 0.3) * i * Math.abs(layerHeight);
          const curveLength = curve.getLength() || 1; // Fallback to 1 if getLength fails
          const tFromStart = Math.min(Math.max(distance / curveLength, 0), 1);
          const t = 1 - tFromStart; // Reverse direction: start from tip (t=1)
          const point = curve.getPointAt(t);
          position = [point.x, point.y, point.z];
        } else {
          // Default linear positioning
          const y = Math.pow(growingStage, 0.3) * i * layerHeight;
          position = [0, y, 0];
        }

        return renderElement({
          index: i,
          age,
          growingStage,
          dyingStage,
          position,
          rotation,
          baseColor,
          shadowColor,
          subsurfaceColor
        });
      })}
    </group>
  );
}
