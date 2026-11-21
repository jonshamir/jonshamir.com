import type {
  FrondControls,
  LevelControls,
  OutlineControls
} from "../fernControls";
import { envelope, mulberry32, smoothstep } from "./curves";

export type FernParams = {
  frond: FrondControls;
  levels: [LevelControls, LevelControls, LevelControls];
  outline: OutlineControls;
};

// Three vec4 per primitive, uploaded as instanced attributes:
//   a: p0.xy, p1.xy          segment endpoints
//   b: w0, w1, a0, a1         lamina / midrib half-widths
//   c: t0, t1, terminal, 0    normalized position along the node
export type FrondGeometry = {
  a: Float32Array;
  b: Float32Array;
  c: Float32Array;
  count: number;
  truncated: boolean;
};

export const MAX_PRIMITIVES = 40000;

const APICAL_DROP = 1.5;
const MIN_LENGTH = 2e-4;
const LEVEL_TAPER = 0.3;
const RACHIS_SEGMENTS = 56;

type Node = {
  level: number;
  x: number;
  y: number;
  heading: number;
  length: number;
  pre: number;
  D: number;
  side: number;
  curl: number;
  axisWidth: number;
  axisTaper: number;
  stalk: number;
  wing: number;
  hash: number;
};

type Sample = { x: number; y: number; heading: number; s: number };

function hash2(a: number, b: number): number {
  let h = Math.imul(a ^ (b + 0x9e3779b9 + (a << 6) + (a >>> 2)), 0x85ebca6b);
  h ^= h >>> 13;
  return Math.imul(h, 0xc2b2ae35) >>> 0;
}

const DEG = Math.PI / 180;

export function generateFrond(params: FernParams): FrondGeometry {
  const { frond, levels, outline } = params;

  const a = new Float32Array(MAX_PRIMITIVES * 4);
  const b = new Float32Array(MAX_PRIMITIVES * 4);
  const c = new Float32Array(MAX_PRIMITIVES * 4);
  let count = 0;
  let truncated = false;

  const outlineEnvelope = outline;
  const droop = frond.droop;

  function samplesFor(node: Node, terminal: boolean): number {
    if (node.level === 0) return RACHIS_SEGMENTS;
    const n = Math.round(node.length * (terminal ? 60 : 80));
    return terminal
      ? Math.min(Math.max(n, 3), 12)
      : Math.min(Math.max(n, 5), 32);
  }

  function integrate(node: Node, segments: number): Sample[] {
    const L = node.length;
    const total = L + node.pre;
    const ds = total / segments;
    const turn = (node.curl * DEG) / L;
    const pts: Sample[] = [];
    let x = node.x;
    let y = node.y;
    let heading = node.heading;

    for (let i = 0; i <= segments; i++) {
      const s = -node.pre + i * ds;
      pts.push({ x, y, heading, s });
      const t = Math.max(s / L, 0);
      const gravity = -droop * Math.cos(heading) * (1 - t);
      const mid = heading + 0.5 * ds * (turn + gravity);
      x += Math.cos(mid) * ds;
      y += Math.sin(mid) * ds;
      heading += ds * (turn + gravity);
    }
    return pts;
  }

  function sampleAt(pts: Sample[], node: Node, t: number): Sample {
    const total = node.length + node.pre;
    const f = ((t * node.length + node.pre) / total) * (pts.length - 1);
    const i = Math.min(Math.max(Math.floor(f), 0), pts.length - 2);
    const k = f - i;
    const p = pts[i];
    const q = pts[i + 1];
    return {
      x: p.x + (q.x - p.x) * k,
      y: p.y + (q.y - p.y) * k,
      heading: p.heading + (q.heading - p.heading) * k,
      s: p.s + (q.s - p.s) * k
    };
  }

  function laminaAt(node: Node, t: number, wingFrac: number): number {
    if (t < 0 || wingFrac <= 0) return 0;
    const stalkMask =
      node.stalk > 0 ? smoothstep(node.stalk, node.stalk + 0.08, t) : 1;
    return (
      wingFrac *
      outline.width *
      node.length *
      envelope(t, outlineEnvelope) *
      stalkMask
    );
  }

  function axisAt(node: Node, t: number): number {
    const u = Math.min(Math.max(t, 0), 1);
    return node.axisWidth * (1 + (node.axisTaper - 1) * u);
  }

  function emitAxis(node: Node, pts: Sample[], terminal: boolean) {
    const L = node.length;
    const wingFrac = Math.max(Math.min(1 - node.D, 1), node.wing, 0);

    for (let i = 0; i < pts.length - 1; i++) {
      if (count >= MAX_PRIMITIVES) {
        truncated = true;
        return;
      }
      const p = pts[i];
      const q = pts[i + 1];
      const o = count * 4;
      a[o] = p.x;
      a[o + 1] = p.y;
      a[o + 2] = q.x;
      a[o + 3] = q.y;
      b[o] = laminaAt(node, p.s / L, wingFrac);
      b[o + 1] = laminaAt(node, q.s / L, wingFrac);
      b[o + 2] = axisAt(node, p.s / L);
      b[o + 3] = axisAt(node, q.s / L);
      c[o] = p.s / L;
      c[o + 1] = q.s / L;
      c[o + 2] = terminal ? 1 : 0;
      c[o + 3] = 0;
      count++;
    }
  }

  function build(node: Node) {
    if (count >= MAX_PRIMITIVES) {
      truncated = true;
      return;
    }

    const terminal = node.D <= 0;
    const pts = integrate(node, samplesFor(node, terminal));
    emitAxis(node, pts, terminal);
    if (terminal) return;

    const P = levels[Math.min(node.level, 2)];
    const grow = smoothstep(0, 0.4, node.D);
    const n = Math.max(P.count, 1);
    const whole = Math.floor(n);
    const pairs = Math.ceil(n);
    const start = node.level === 0 ? 0 : node.stalk;

    for (let i = 0; i < pairs; i++) {
      const frac = i < whole ? 1 : n - whole;
      const x = Math.min((i + 0.5) / n, 0.999);

      for (const side of [1, -1]) {
        const childHash = hash2(node.hash, i * 2 + (side > 0 ? 1 : 0));
        const rng = mulberry32(childHash);
        const lengthJitter = 1 + frond.jitter * (rng() - 0.5) * 0.5;
        const angleJitter = frond.jitter * (rng() - 0.5) * 0.3;

        const xs = side < 0 ? x + P.alternate / n : x;
        if (xs >= 1) continue;
        const t = start + (1 - start) * Math.pow(xs, P.spacing);

        let bias: number;
        if (node.level === 0) {
          bias = 1 + side * frond.asymmetry;
        } else {
          const raw =
            side === -node.side ? (P.acroscopic ?? 1) : (P.basiscopic ?? 1);
          bias = 1 + (raw - 1) * (1 - t) * (1 - t);
        }

        const length =
          node.length *
          P.length *
          envelope(t, P) *
          bias *
          grow *
          frac *
          lengthJitter;
        if (length < MIN_LENGTH) continue;

        const apical = APICAL_DROP * smoothstep(1 - frond.apex, 1, t);
        const angle = (P.angle + (P.angleApex - P.angle) * t) * DEG;
        const at = sampleAt(pts, node, t);

        build({
          level: node.level + 1,
          x: at.x,
          y: at.y,
          heading: at.heading + side * angle + angleJitter,
          length,
          pre: 0,
          D: node.D - 1 - apical,
          side,
          curl: -side * P.curl,
          axisWidth: P.width * length,
          axisTaper: LEVEL_TAPER,
          stalk: P.stalk,
          wing: P.wing,
          hash: childHash
        });
      }
    }
  }

  build({
    level: 0,
    x: 0,
    y: -0.5 - frond.stipe,
    heading: Math.PI / 2 + frond.lean * DEG,
    length: 1,
    pre: frond.stipe,
    D: frond.division,
    side: 0,
    curl: frond.curl,
    axisWidth: frond.width,
    axisTaper: frond.taper,
    stalk: 0,
    wing: frond.wing,
    hash: hash2(0x2545f491, Math.round(frond.seed))
  });

  return { a, b, c, count, truncated };
}
