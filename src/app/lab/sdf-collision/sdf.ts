// JS-side SDF functions — keep in sync with sdfCollision.glsl.ts

export function sdCircle(px: number, py: number, r: number): number {
  return Math.sqrt(px * px + py * py) - r;
}

export function sdBox(px: number, py: number, bx: number, by: number): number {
  const dx = Math.abs(px) - bx;
  const dy = Math.abs(py) - by;
  const mdx = Math.max(dx, 0);
  const mdy = Math.max(dy, 0);
  return Math.sqrt(mdx * mdx + mdy * mdy) + Math.min(Math.max(dx, dy), 0);
}

export function sdRoundedBox(
  px: number,
  py: number,
  bx: number,
  by: number,
  r: number
): number {
  return sdBox(px, py, bx - r, by - r) - r;
}

// Shared mutable return object — callers must read .x/.y immediately before
// the next call to sdfGradient, as values are overwritten on each invocation.
const _gradOut = { x: 0, y: 1 };

export function sdfGradient(
  evalFn: (px: number, py: number) => number,
  px: number,
  py: number,
  eps = 0.005
): typeof _gradOut {
  const dx = evalFn(px + eps, py) - evalFn(px - eps, py);
  const dy = evalFn(px, py + eps) - evalFn(px, py - eps);
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1e-10) {
    _gradOut.x = 0;
    _gradOut.y = 1;
  } else {
    _gradOut.x = dx / len;
    _gradOut.y = dy / len;
  }
  return _gradOut;
}
