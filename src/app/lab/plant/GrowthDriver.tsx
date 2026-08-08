import { useFrame, useThree } from "@react-three/fiber";
import { RefObject, useEffect } from "react";

import {
  computeGrowthValues,
  GrowthParams,
  GrowthValues,
  totalDuration
} from "./growth";

// Advances the growth timeline. Must live inside the Canvas (useFrame);
// PlantCanvas itself renders outside it.
export function GrowthDriver({
  progressRef,
  playingRef,
  paramsRef,
  onFrame
}: {
  progressRef: RefObject<number>;
  playingRef: RefObject<boolean>;
  paramsRef: RefObject<GrowthParams>;
  onFrame: (values: GrowthValues) => void;
}) {
  const invalidate = useThree((state) => state.invalidate);

  // Kick the first frame under frameloop="demand".
  useEffect(() => {
    if (playingRef.current) invalidate();
  }, [playingRef, invalidate]);

  useFrame((_, delta) => {
    if (!playingRef.current) return;
    const params = paramsRef.current;
    const step = Math.min(delta, 0.05) / totalDuration(params);
    progressRef.current = Math.min(1, progressRef.current + step);
    onFrame(computeGrowthValues(progressRef.current, params));
    if (progressRef.current >= 1) {
      playingRef.current = false;
    } else {
      invalidate();
    }
  });

  return null;
}
