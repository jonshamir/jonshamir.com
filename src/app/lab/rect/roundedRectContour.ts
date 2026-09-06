import { bendX, bendZ } from "./curvedPlaneGeometry";

type Point2D = [number, number];

const EPS = 1e-9;

function cornerRadius(width: number, height: number, radius: number) {
  return Math.max(0, Math.min(radius, Math.min(width, height)) / 2);
}

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

// The flat contour, split at every chord boundary. Its point count depends only
// on the rect's dimensions and `segments` — never on the curve radius — so one
// contour can be bent to any radius, which is what lets bendContourInto animate
// a live line. Only the curved path goes through here: the flat case below
// keeps the unsplit contour it has always used.
export function createRefinedContour(
  width: number,
  height: number,
  radius: number,
  segments: number,
  cornerSegments = 8
): Point2D[] {
  const hw = width / 2;
  const contour = buildContour(
    hw,
    height / 2,
    cornerRadius(width, height, radius),
    cornerSegments
  );
  return insertChordCrossings(contour, hw, width / segments);
}

// Bends a refined contour, writing xyz triplets into `out` (3 per point).
// Allocation-free, so the frame loop can drive it.
//
// The fill quad renders the cylinder as `segments` flat chords, so the line
// must lie on that chord surface — not the true cylinder — or it dips behind
// the fill between quad vertices. The contour already carries a point at every
// chord boundary; positions in between interpolate along the bent chord.
export function bendContourInto(
  contour: Point2D[],
  width: number,
  segments: number,
  curveRadius: number,
  out: Float32Array
) {
  const hw = width / 2;
  const step = width / segments;
  for (let i = 0; i < contour.length; i++) {
    const [x, y] = contour[i];
    const seg = Math.min(
      segments - 1,
      Math.max(0, Math.floor((x + hw) / step))
    );
    const x0 = -hw + seg * step;
    const ax = bendX(x0, curveRadius);
    const az = bendZ(x0, curveRadius);
    const bx = bendX(x0 + step, curveRadius);
    const bz = bendZ(x0 + step, curveRadius);
    const t = (x - x0) / step;
    out[i * 3] = ax + (bx - ax) * t;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = az + (bz - az) * t;
  }
}

export function createRoundedRectContourPoints(
  width: number,
  height: number,
  radius: number,
  segments: number,
  curveRadius: number,
  cornerSegments = 8
): [number, number, number][] {
  if (curveRadius === 0) {
    const contour = buildContour(
      width / 2,
      height / 2,
      cornerRadius(width, height, radius),
      cornerSegments
    );
    return contour.map(([x, y]) => [x, y, 0]);
  }

  const contour = createRefinedContour(
    width,
    height,
    radius,
    segments,
    cornerSegments
  );
  const out = new Float32Array(contour.length * 3);
  bendContourInto(contour, width, segments, curveRadius, out);
  return contour.map((_, i) => [out[i * 3], out[i * 3 + 1], out[i * 3 + 2]]);
}
