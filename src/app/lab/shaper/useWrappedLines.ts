import {
  layoutWithLines,
  measureLineStats,
  prepareWithSegments
} from "@chenglou/pretext";
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

export function useMaxWrappedLineCount(
  texts: string[],
  maxWidth: number,
  font: string
): number {
  const key = texts.join("");
  return useMemo(() => {
    if (!maxWidth || !font || texts.length === 0) return 1;
    let max = 1;
    for (const t of texts) {
      if (!t) continue;
      try {
        const prepared = prepareWithSegments(t, font);
        const { lineCount } = measureLineStats(prepared, maxWidth);
        if (lineCount > max) max = lineCount;
      } catch {
        // ignore
      }
    }
    return max;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, maxWidth, font]);
}
