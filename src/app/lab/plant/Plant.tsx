import { Color, Euler } from "three";

import { useControls } from "../../../lib/tweakpane";
import { CustomLeaf } from "./CustomLeaf";
import { PhyllotaxisSpawner } from "./PhyllotaxisSpawner";

const GOLDEN_ANGLE = 2.39996;

interface PlantProps {
  age: number;
  maturity?: number; // 0 = all leaves young, 1 = normal matureAge
  matureAgeStartMult?: number; // effective matureAge multiplier at maturity 0
  position?: [number, number, number];
  rotation?: Euler;
  baseColor?: Color;
  shadowColor?: Color;
  subsurfaceColor?: Color;
}

export function Plant({
  age: n,
  maturity = 1,
  matureAgeStartMult = 1,
  baseColor,
  shadowColor,
  subsurfaceColor,
  ...props
}: PlantProps) {
  const { matureAge, basePitch, baseYaw, layerHeight } = useControls(
    "Plant ",
    {
      matureAge: { value: 30, min: 1, max: 300, step: 1 },
      basePitch: { value: -1.55, min: -Math.PI, max: Math.PI },
      baseYaw: { value: GOLDEN_ANGLE, min: 0, max: Math.PI },
      layerHeight: { value: 0.01, min: 0, max: 0.2 }
    },
    { collapsed: true }
  ) as {
    matureAge: number;
    basePitch: number;
    baseYaw: number;
    layerHeight: number;
  };

  // growingStage = pow(2*age, 0.3) is steep near 0, so matureAge must sweep
  // into the thousands for leaves to read young — interpolate in log space.
  const effectiveMatureAge =
    matureAge * Math.pow(matureAgeStartMult, 1 - maturity);

  return (
    <PhyllotaxisSpawner
      count={n}
      matureAge={effectiveMatureAge}
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
