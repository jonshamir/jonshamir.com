import { useControls } from "leva";
import { Color, Euler } from "three";

import { CustomLeaf } from "./CustomLeaf";
import { PhyllotaxisSpawner } from "./PhyllotaxisSpawner";

const GOLDEN_ANGLE = 2.39996;

interface PlantProps {
  age: number;
  position?: [number, number, number];
  rotation?: Euler;
  baseColor?: Color;
  shadowColor?: Color;
  subsurfaceColor?: Color;
}

export function Plant({
  age: n,
  baseColor,
  shadowColor,
  subsurfaceColor,
  ...props
}: PlantProps) {
  const { matureAge, basePitch, baseYaw, layerHeight } = useControls("Plant ", {
    matureAge: { value: 50, min: 1, max: 300, step: 1 },
    basePitch: { value: -1.55, min: -Math.PI, max: Math.PI },
    baseYaw: { value: GOLDEN_ANGLE, min: 0, max: Math.PI },
    layerHeight: { value: 0.01, min: 0, max: 0.2 }
  });

  return (
    <PhyllotaxisSpawner
      count={n}
      matureAge={matureAge}
      baseYaw={baseYaw}
      basePitch={basePitch}
      layerHeight={layerHeight}
      baseColor={baseColor}
      shadowColor={shadowColor}
      subsurfaceColor={subsurfaceColor}
      renderElement={(spawnProps) => (
        <CustomLeaf key={spawnProps.index} {...spawnProps} />
      )}
      {...props}
    />
  );
}
