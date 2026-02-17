import { useMemo } from "react";
import { Color } from "three";

export function useLinearColor(hex: string): Color {
  return useMemo(() => {
    const color = new Color(hex);
    color.convertLinearToSRGB();
    return color;
  }, [hex]);
}
