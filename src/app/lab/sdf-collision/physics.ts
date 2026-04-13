import { MAX_SHAPES } from "./constants";
import { sdBox, sdCircle, sdfGradient, sdRoundedBox } from "./sdf";

export const enum ShapeType {
  Circle = 0,
  Box = 1,
  RoundedBox = 2
}

export interface Shape {
  type: ShapeType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  radius: number;
  sizeY: number;
  cornerRadius: number;
  color: [number, number, number];
  mass: number;
  inertia: number;
}

const COLORS: [number, number, number][] = [
  [0.91, 0.3, 0.24], // red
  [0.18, 0.8, 0.44], // green
  [0.2, 0.6, 0.86], // blue
  [0.61, 0.35, 0.71], // purple
  [0.95, 0.61, 0.07], // orange
  [0.09, 0.63, 0.52], // teal
  [0.91, 0.76, 0.04], // yellow
  [0.83, 0.33, 0.61] // pink
];

const CURSOR_RADIUS = 0.2;
const CURSOR_BOUNCE = 1.2;
const WALL_FRICTION = 0.3;
const SHAPE_FRICTION = 0.4;
const SEPARATION_FACTOR = 0.5;
const SUBSTEPS = 2;

function evaluateShapeSDF(
  shape: Shape,
  px: number,
  py: number,
  ca: number,
  sa: number
): number {
  // Rotate query point into shape's local frame
  const lx = ca * px - sa * py;
  const ly = sa * px + ca * py;

  switch (shape.type) {
    case ShapeType.Circle:
      return sdCircle(lx, ly, shape.radius);
    case ShapeType.Box:
      return sdBox(lx, ly, shape.radius, shape.sizeY);
    case ShapeType.RoundedBox:
      return sdRoundedBox(
        lx,
        ly,
        shape.radius,
        shape.sizeY,
        shape.cornerRadius
      );
  }
}

function effectiveRadius(s: Shape): number {
  return s.type === ShapeType.Circle ? s.radius : Math.max(s.radius, s.sizeY);
}

function directionalRadius(
  s: Shape,
  dirX: number,
  dirY: number,
  ca: number,
  sa: number
): number {
  if (s.type === ShapeType.Circle) return s.radius;

  // Transform direction into shape's local frame
  const lx = ca * dirX - sa * dirY;
  const ly = sa * dirX + ca * dirY;
  const len = Math.sqrt(lx * lx + ly * ly);
  if (len < 1e-10) return Math.min(s.radius, s.sizeY);
  const nlx = Math.abs(lx / len);
  const nly = Math.abs(ly / len);

  const bx =
    s.type === ShapeType.RoundedBox ? s.radius - s.cornerRadius : s.radius;
  const by =
    s.type === ShapeType.RoundedBox ? s.sizeY - s.cornerRadius : s.sizeY;

  const tx = nlx > 1e-10 ? bx / nlx : 1e10;
  const ty = nly > 1e-10 ? by / nly : 1e10;
  const t = Math.min(tx, ty);

  return s.type === ShapeType.RoundedBox ? t + s.cornerRadius : t;
}

export function initShapes(
  count: number,
  worldScale: number,
  centerX = 0,
  centerY = 0,
  sizeMultiplier = 1
): Shape[] {
  const shapes: Shape[] = [];
  const spawnRadius = worldScale * 0.15;

  for (let i = 0; i < count; i++) {
    const type = [ShapeType.Circle, ShapeType.Circle, ShapeType.RoundedBox][
      Math.floor(Math.random() * 3)
    ];
    const baseSize = (0.25 + Math.random() * 0.45) * sizeMultiplier;

    const mass = baseSize * baseSize * Math.PI;
    const shape: Shape = {
      type,
      x: centerX + (Math.random() - 0.5) * spawnRadius,
      y: centerY + (Math.random() - 0.5) * spawnRadius,
      vx: 0,
      vy: 0,
      angle: 0,
      angularVelocity: 0,
      radius: baseSize,
      sizeY:
        type === ShapeType.Circle
          ? baseSize
          : baseSize * (0.6 + Math.random() * 0.8),
      cornerRadius: type === ShapeType.RoundedBox ? baseSize * 0.3 : 0,
      color: COLORS[i % COLORS.length],
      mass,
      inertia: mass * baseSize * baseSize * 0.5
    };
    shapes.push(shape);
  }

  return shapes;
}

export interface PhysicsOptions {
  gravity: number;
  cursorVx: number;
  cursorVy: number;
  restitution: number;
  damping: number;
  worldScale: number;
  mouseDown: boolean;
  aspect: number;
  centerGravity: boolean;
  gravityCenterX: number;
  gravityCenterY: number;
}

// Pre-allocated arrays to avoid per-frame GC pressure
const cosAngles = new Float64Array(MAX_SHAPES);
const sinAngles = new Float64Array(MAX_SHAPES);

function applyCursorCollision(
  s: Shape,
  mouseX: number,
  mouseY: number,
  cursorVx: number,
  cursorVy: number
): void {
  const dx = s.x - mouseX;
  const dy = s.y - mouseY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = CURSOR_RADIUS + effectiveRadius(s);
  if (dist < minDist && dist > 0.001) {
    const nx = dx / dist,
      ny = dy / dist;
    const penetration = minDist - dist;
    s.x += nx * penetration;
    s.y += ny * penetration;
    const relVx = s.vx - cursorVx;
    const relVy = s.vy - cursorVy;
    const relVn = relVx * nx + relVy * ny;
    if (relVn < 0) {
      s.vx -= relVn * nx * CURSOR_BOUNCE;
      s.vy -= relVn * ny * CURSOR_BOUNCE;
    }
  }
}

function applyWallConstraints(
  s: Shape,
  halfW: number,
  halfH: number,
  restitution: number
): void {
  let effectiveX: number, effectiveY: number;
  if (s.type === ShapeType.Circle) {
    effectiveX = effectiveY = s.radius;
  } else {
    const cosA = Math.abs(Math.cos(s.angle));
    const sinA = Math.abs(Math.sin(s.angle));
    effectiveX = cosA * s.radius + sinA * s.sizeY;
    effectiveY = sinA * s.radius + cosA * s.sizeY;
  }

  // Bottom wall
  if (s.y - effectiveY < -halfH) {
    s.y = -halfH + effectiveY;
    s.vy = Math.abs(s.vy) * restitution;
    const vt = s.vx + s.angularVelocity * effectiveY;
    s.angularVelocity -= (vt * WALL_FRICTION) / effectiveY;
  }
  // Top wall
  if (s.y + effectiveY > halfH) {
    s.y = halfH - effectiveY;
    s.vy = -Math.abs(s.vy) * restitution;
    const vt = s.vx - s.angularVelocity * effectiveY;
    s.angularVelocity += (vt * WALL_FRICTION) / effectiveY;
  }
  // Left wall
  if (s.x - effectiveX < -halfW) {
    s.x = -halfW + effectiveX;
    s.vx = Math.abs(s.vx) * restitution;
    const vt = s.vy - s.angularVelocity * effectiveX;
    s.angularVelocity += (vt * WALL_FRICTION) / effectiveX;
  }
  // Right wall
  if (s.x + effectiveX > halfW) {
    s.x = halfW - effectiveX;
    s.vx = -Math.abs(s.vx) * restitution;
    const vt = s.vy + s.angularVelocity * effectiveX;
    s.angularVelocity -= (vt * WALL_FRICTION) / effectiveX;
  }
}

function resolveShapePairCollision(
  a: Shape,
  b: Shape,
  cosA: number,
  sinA: number,
  cosB: number,
  sinB: number,
  gradEvalFn: (px: number, py: number) => number,
  restitution: number
): void {
  const relX = a.x - b.x;
  const relY = a.y - b.y;

  const distAtoB = evaluateShapeSDF(b, relX, relY, cosB, sinB);
  const effA = directionalRadius(a, -relX, -relY, cosA, sinA);

  const distBtoA = evaluateShapeSDF(a, -relX, -relY, cosA, sinA);
  const effB = directionalRadius(b, relX, relY, cosB, sinB);

  const penetration = Math.max(effA - distAtoB, effB - distBtoA);
  if (penetration <= 0) return;

  const grad = sdfGradient(gradEvalFn, relX, relY);
  const nx = grad.x,
    ny = grad.y;

  // Separate shapes
  const totalMass = a.mass + b.mass;
  const sepA = penetration * (b.mass / totalMass) * SEPARATION_FACTOR;
  const sepB = penetration * (a.mass / totalMass) * SEPARATION_FACTOR;
  a.x += nx * sepA;
  a.y += ny * sepA;
  b.x -= nx * sepB;
  b.y -= ny * sepB;

  // Impulse-based velocity response
  const relVx = a.vx - b.vx;
  const relVy = a.vy - b.vy;
  const relVn = relVx * nx + relVy * ny;

  if (relVn < 0) {
    const imp = (-(1 + restitution) * relVn) / (1 / a.mass + 1 / b.mass);
    a.vx += (imp * nx) / a.mass;
    a.vy += (imp * ny) / a.mass;
    b.vx -= (imp * nx) / b.mass;
    b.vy -= (imp * ny) / b.mass;

    // Contact point offsets from centers
    const rAx = -nx * effA;
    const rAy = -ny * effA;
    const rBx = nx * distAtoB;
    const rBy = ny * distAtoB;

    // Tangential friction impulse for rotation
    const tx = -ny;
    const ty = nx;
    const vcAx = a.vx - a.angularVelocity * rAy;
    const vcAy = a.vy + a.angularVelocity * rAx;
    const vcBx = b.vx - b.angularVelocity * rBy;
    const vcBy = b.vy + b.angularVelocity * rBx;
    const relVt = (vcAx - vcBx) * tx + (vcAy - vcBy) * ty;

    // Friction impulse (clamped to Coulomb cone)
    const rACrossT = rAx * ty - rAy * tx;
    const rBCrossT = rBx * ty - rBy * tx;
    const jt =
      -relVt /
      (1 / a.mass +
        1 / b.mass +
        (rACrossT * rACrossT) / a.inertia +
        (rBCrossT * rBCrossT) / b.inertia);
    const jtClamped =
      Math.abs(jt) > SHAPE_FRICTION * imp
        ? Math.sign(jt) * SHAPE_FRICTION * imp
        : jt;

    a.vx += (jtClamped * tx) / a.mass;
    a.vy += (jtClamped * ty) / a.mass;
    b.vx -= (jtClamped * tx) / b.mass;
    b.vy -= (jtClamped * ty) / b.mass;
    a.angularVelocity +=
      (rAx * (jtClamped * ty) - rAy * (jtClamped * tx)) / a.inertia;
    b.angularVelocity -=
      (rBx * (jtClamped * ty) - rBy * (jtClamped * tx)) / b.inertia;
  }
}

export function stepPhysics(
  shapes: Shape[],
  dt: number,
  mouseX: number,
  mouseY: number,
  opts: PhysicsOptions
): void {
  const {
    gravity,
    cursorVx,
    cursorVy,
    restitution,
    damping,
    worldScale,
    aspect,
    centerGravity,
    gravityCenterX,
    gravityCenterY
  } = opts;
  const subDt = dt / SUBSTEPS;
  const n = shapes.length;
  const halfH = worldScale * 0.5;
  const halfW = halfH * aspect;
  // Convert 0–1 gravity center to world coordinates
  const gcx = (gravityCenterX - 0.5) * 2 * halfW;
  const gcy = -(gravityCenterY - 0.5) * 2 * halfH;

  for (let step = 0; step < SUBSTEPS; step++) {
    // Cursor collision
    for (let i = 0; i < n; i++) {
      applyCursorCollision(shapes[i], mouseX, mouseY, cursorVx, cursorVy);
    }

    // Integration
    const centerStrength = 3;
    const dampFactor = 1 - damping * subDt;
    for (let i = 0; i < n; i++) {
      const s = shapes[i];
      s.vy -= gravity * subDt;
      if (centerGravity) {
        const dx = s.x - gcx;
        const dy = s.y - gcy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.01) {
          s.vx -= (dx / dist) * centerStrength * subDt;
          s.vy -= (dy / dist) * centerStrength * subDt;
        }
      }
      s.vx *= dampFactor;
      s.vy *= dampFactor;
      s.angularVelocity *= dampFactor;
      s.x += s.vx * subDt;
      s.y += s.vy * subDt;
      s.angle += s.angularVelocity * subDt;
    }

    // Wall collision
    for (let i = 0; i < n; i++) {
      applyWallConstraints(shapes[i], halfW, halfH, restitution);
    }

    // Pre-compute trig values for collision
    for (let i = 0; i < n; i++) {
      cosAngles[i] = Math.cos(-shapes[i].angle);
      sinAngles[i] = Math.sin(-shapes[i].angle);
    }

    // Reusable closure for sdfGradient to avoid per-pair allocation
    let _gradShape: Shape;
    let _gradCa: number;
    let _gradSa: number;
    const gradEvalFn = (px: number, py: number) =>
      evaluateShapeSDF(_gradShape, px, py, _gradCa, _gradSa);

    // Inter-shape collision
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        _gradShape = shapes[j];
        _gradCa = cosAngles[j];
        _gradSa = sinAngles[j];
        resolveShapePairCollision(
          shapes[i],
          shapes[j],
          cosAngles[i],
          sinAngles[i],
          cosAngles[j],
          sinAngles[j],
          gradEvalFn,
          restitution
        );
      }
    }
  }
}
