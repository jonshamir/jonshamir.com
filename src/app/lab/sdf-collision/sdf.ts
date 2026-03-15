// JS-side SDF functions mirroring the GLSL implementations (Inigo Quilez)

export function sdCircle(px: number, py: number, r: number): number {
  return Math.sqrt(px * px + py * py) - r;
}

export function sdBox(px: number, py: number, bx: number, by: number): number {
  const dx = Math.abs(px) - bx;
  const dy = Math.abs(py) - by;
  return (
    Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2) +
    Math.min(Math.max(dx, dy), 0)
  );
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

export function sdfGradient(
  evalFn: (px: number, py: number) => number,
  px: number,
  py: number,
  eps = 0.005
): [number, number] {
  const dx = evalFn(px + eps, py) - evalFn(px - eps, py);
  const dy = evalFn(px, py + eps) - evalFn(px, py - eps);
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1e-10) return [0, 1];
  return [dx / len, dy / len];
}
