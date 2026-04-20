import { useMemo } from "react";
import { Color } from "three";

export function useLinearColor(hex: string): Color {
  return useMemo(() => {
    const color = new Color(hex);
    color.convertLinearToSRGB();
    return color;
  }, [hex]);
}

// Converts an object of hex strings into an object of THREE.Colors (linear
// space). Keys are preserved. Recomputes only when one of the hex values
// changes, keyed by the serialized value list.
export function useLinearColors<K extends string>(
  hexes: Record<K, string>
): Record<K, Color> {
  const key = JSON.stringify(hexes);
  return useMemo(() => {
    const out = {} as Record<K, Color>;
    for (const k of Object.keys(hexes) as K[]) {
      const color = new Color(hexes[k]);
      color.convertLinearToSRGB();
      out[k] = color;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
