import { bendAroundY } from "./curvedPlaneGeometry";

type Point2D = [number, number];

const EPS = 1e-9;

function buildContour(hw: number, hh: number, r: number, arcSegments: number) {
  const points: Point2D[] = [];
  const arcSteps = r > 0 ? arcSegments : 1;
  const halfPi = Math.PI / 2;
  const addArc = (cx: number, cy: number, startAngle: number) => {
    for (let i = 0; i < arcSteps; i++) {
      const angle = startAngle + (i / arcSteps) * halfPi;
      points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
  };

  points.push([hw, -hh + r]);
  addArc(hw - r, hh - r, 0);
  points.push([hw - r, hh]);
  addArc(-hw + r, hh - r, halfPi);
  points.push([-hw, hh - r]);
  addArc(-hw + r, -hh + r, Math.PI);
  points.push([-hw + r, -hh]);
  addArc(hw - r, -hh + r, Math.PI + halfPi);
  points.push([...points[0]]);

  // Zero-length edges (radius = half the smaller dimension) emit consecutive
  // duplicates, which render as join artifacts in Line2.
  return points.filter((p, i) => {
    if (i === 0) return true;
    const prev = points[i - 1];
    return Math.abs(p[0] - prev[0]) > EPS || Math.abs(p[1] - prev[1]) > EPS;
  });
}

function insertChordCrossings(contour: Point2D[], hw: number, step: number) {
  const refined: Point2D[] = [];
  for (let i = 0; i < contour.length - 1; i++) {
    const [x0, y0] = contour[i];
    const [x1, y1] = contour[i + 1];
    refined.push(contour[i]);
    const lo = Math.min(x0, x1);
    const hi = Math.max(x0, x1);
    const crossings: number[] = [];
    for (
      let k = Math.ceil((lo + hw) / step);
      k <= Math.floor((hi + hw) / step);
      k++
    ) {
      const kx = -hw + k * step;
      if (kx > lo + EPS && kx < hi - EPS) crossings.push(kx);
    }
    if (x1 < x0) crossings.reverse();
    for (const kx of crossings) {
      const t = (kx - x0) / (x1 - x0);
      refined.push([kx, y0 + (y1 - y0) * t]);
    }
  }
  refined.push(contour[contour.length - 1]);
  return refined;
}

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
  const contour = buildContour(hw, hh, r, cornerSegments);

  if (curveRadius === 0) return contour.map(([x, y]) => [x, y, 0]);

  // The fill quad renders the cylinder as `segments` flat chords, so the line
  // must lie on that chord surface — not the true cylinder — or it dips behind
  // the fill between quad vertices. Split segments at every chord boundary,
  // then interpolate positions along the bent chords.
  const step = width / segments;
  const bendOntoChords = ([x, y]: Point2D): [number, number, number] => {
    const i = Math.min(segments - 1, Math.max(0, Math.floor((x + hw) / step)));
    const x0 = -hw + i * step;
    const [ax, , az] = bendAroundY(x0, y, curveRadius);
    const [bx, , bz] = bendAroundY(x0 + step, y, curveRadius);
    const t = (x - x0) / step;
    return [ax + (bx - ax) * t, y, az + (bz - az) * t];
  };

  return insertChordCrossings(contour, hw, step).map(bendOntoChords);
}
