import { bendAroundY } from "./curvedPlaneGeometry";

export function createRoundedRectContourPoints(
  width: number,
  height: number,
  radius: number,
  segments: number,
  curveRadius: number,
  cornerSegments = 8
): [number, number, number][] {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.max(0, Math.min(radius, Math.min(width, height)) / 2);
  const arcSteps = r > 0 ? cornerSegments : 1;
  const edgeSteps = curveRadius === 0 ? 1 : segments;
  const halfPi = Math.PI / 2;

  const points2D: [number, number][] = [];
  const addLine = (
    from: [number, number],
    to: [number, number],
    steps: number
  ) => {
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      points2D.push([
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t
      ]);
    }
  };
  const addArc = (cx: number, cy: number, startAngle: number) => {
    for (let i = 0; i < arcSteps; i++) {
      const angle = startAngle + (i / arcSteps) * halfPi;
      points2D.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
  };

  addLine([hw, -hh + r], [hw, hh - r], 1);
  addArc(hw - r, hh - r, 0);
  addLine([hw - r, hh], [-hw + r, hh], edgeSteps);
  addArc(-hw + r, hh - r, halfPi);
  addLine([-hw, hh - r], [-hw, -hh + r], 1);
  addArc(-hw + r, -hh + r, Math.PI);
  addLine([-hw + r, -hh], [hw - r, -hh], edgeSteps);
  addArc(hw - r, -hh + r, Math.PI + halfPi);
  points2D.push([...points2D[0]]);

  // Zero-length edges (radius = half the smaller dimension) emit consecutive
  // duplicates, which render as join artifacts in Line2.
  const eps = 1e-9;
  const contour = points2D.filter((p, i) => {
    if (i === 0) return true;
    const prev = points2D[i - 1];
    return Math.abs(p[0] - prev[0]) > eps || Math.abs(p[1] - prev[1]) > eps;
  });

  return contour.map(([x, y]) => bendAroundY(x, y, curveRadius));
}
