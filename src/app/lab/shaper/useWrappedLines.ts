import { layoutWithLines, prepareWithSegments } from "@chenglou/pretext";
import { useMemo } from "react";

export function useWrappedLines(
  text: string,
  maxWidth: number,
  font: string
): string[] {
  return useMemo(() => {
    if (!text) return [];
    if (!maxWidth || !font) return [text];
    try {
      const prepared = prepareWithSegments(text, font);
      const { lines } = layoutWithLines(prepared, maxWidth, 1);
      const out = lines.map((l) => l.text);
      return out.length > 0 ? out : [text];
    } catch {
      return [text];
    }
  }, [text, maxWidth, font]);
}
