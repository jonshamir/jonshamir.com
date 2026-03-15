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

function evaluateShapeSDF(shape: Shape, px: number, py: number): number {
  // Rotate query point into shape's local frame
  const ca = Math.cos(-shape.angle);
  const sa = Math.sin(-shape.angle);
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

export function initShapes(count: number, worldScale: number): Shape[] {
  const shapes: Shape[] = [];
  const halfW = worldScale * 0.4;
  const halfH = worldScale * 0.4;

  for (let i = 0; i < count; i++) {
    const type = [ShapeType.Circle, ShapeType.Circle, ShapeType.RoundedBox][
      Math.floor(Math.random() * 3)
    ];
    const baseSize = 0.25 + Math.random() * 0.45;

    const mass = baseSize * baseSize * Math.PI;
    const shape: Shape = {
      type,
      x: (Math.random() - 0.5) * halfW * 2,
      y: (Math.random() - 0.5) * halfH * 2,
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
  mouseStrength: number;
  restitution: number;
  worldScale: number;
  mouseDown: boolean;
}

export function stepPhysics(
  shapes: Shape[],
  dt: number,
  mouseX: number,
  mouseY: number,
  opts: PhysicsOptions
): void {
  const { gravity, mouseStrength, restitution, worldScale, mouseDown } = opts;
  const damping = 0.5;
  const substeps = 2;
  const subDt = dt / substeps;

  for (let step = 0; step < substeps; step++) {
    for (const s of shapes) {
      // Gravity
      s.vy -= gravity * subDt;

      // Mouse force
      const dx = mouseX - s.x;
      const dy = mouseY - s.y;
      const dist2 = dx * dx + dy * dy;
      const dist = Math.sqrt(dist2);
      if (dist > 0.01) {
        const force = mouseStrength / Math.max(dist2, 0.5);
        const sign = mouseDown ? -1 : 1;
        s.vx += sign * (dx / dist) * force * subDt;
        s.vy += sign * (dy / dist) * force * subDt;
      }

      // Damping
      s.vx *= 1 - damping * subDt;
      s.vy *= 1 - damping * subDt;
      s.angularVelocity *= 1 - damping * subDt;

      // Integrate position and angle
      s.x += s.vx * subDt;
      s.y += s.vy * subDt;
      s.angle += s.angularVelocity * subDt;
    }

    // Wall collision
    const aspect =
      typeof window !== "undefined"
        ? window.innerWidth / window.innerHeight
        : 16 / 9;
    const halfH = worldScale * 0.5;
    const halfW = halfH * aspect;

    for (const s of shapes) {
      const effectiveR = s.radius;

      // Bottom wall
      if (s.y - effectiveR < -halfH) {
        s.y = -halfH + effectiveR;
        s.vy = Math.abs(s.vy) * restitution;
        // Tangential velocity at contact: vt = vx + angularVelocity * effectiveR (contact below center)
        const vt = s.vx + s.angularVelocity * effectiveR;
        s.angularVelocity -= (vt * 0.3) / effectiveR;
      }
      // Top wall
      if (s.y + effectiveR > halfH) {
        s.y = halfH - effectiveR;
        s.vy = -Math.abs(s.vy) * restitution;
        const vt = s.vx - s.angularVelocity * effectiveR;
        s.angularVelocity += (vt * 0.3) / effectiveR;
      }
      // Left wall
      if (s.x - effectiveR < -halfW) {
        s.x = -halfW + effectiveR;
        s.vx = Math.abs(s.vx) * restitution;
        const vt = s.vy - s.angularVelocity * effectiveR;
        s.angularVelocity += (vt * 0.3) / effectiveR;
      }
      // Right wall
      if (s.x + effectiveR > halfW) {
        s.x = halfW - effectiveR;
        s.vx = -Math.abs(s.vx) * restitution;
        const vt = s.vy + s.angularVelocity * effectiveR;
        s.angularVelocity -= (vt * 0.3) / effectiveR;
      }
    }

    // Inter-shape collision
    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        const a = shapes[i];
        const b = shapes[j];

        // Relative position of a's center in b's local space
        const relX = a.x - b.x;
        const relY = a.y - b.y;

        // Distance from a's center to b's surface
        const distAtoB = evaluateShapeSDF(b, relX, relY);
        // Effective radius of a for penetration check
        const effectiveA =
          a.type === ShapeType.Circle ? a.radius : Math.min(a.radius, a.sizeY);

        const penetration = effectiveA - distAtoB;
        if (penetration <= 0) continue;

        // Collision normal: gradient of b's SDF at a's position
        const [nx, ny] = sdfGradient(
          (px, py) => evaluateShapeSDF(b, px, py),
          relX,
          relY
        );

        // Separate shapes
        const totalMass = a.mass + b.mass;
        const sepA = penetration * (b.mass / totalMass) * 0.5;
        const sepB = penetration * (a.mass / totalMass) * 0.5;
        a.x += nx * sepA;
        a.y += ny * sepA;
        b.x -= nx * sepB;
        b.y -= ny * sepB;

        // Impulse-based velocity response
        const relVx = a.vx - b.vx;
        const relVy = a.vy - b.vy;
        const relVn = relVx * nx + relVy * ny;

        if (relVn < 0) {
          const j = (-(1 + restitution) * relVn) / (1 / a.mass + 1 / b.mass);
          a.vx += (j * nx) / a.mass;
          a.vy += (j * ny) / a.mass;
          b.vx -= (j * nx) / b.mass;
          b.vy -= (j * ny) / b.mass;

          // Contact point offsets from centers
          const rAx = -nx * effectiveA;
          const rAy = -ny * effectiveA;
          const rBx = nx * distAtoB;
          const rBy = ny * distAtoB;

          // Tangential friction impulse for rotation
          // Tangent direction (perpendicular to normal)
          const tx = -ny;
          const ty = nx;
          // Relative velocity at contact point including angular contributions
          // v_contact = v_center + omega × r (in 2D: omega × r = (-omega*ry, omega*rx))
          const vcAx = a.vx - a.angularVelocity * rAy;
          const vcAy = a.vy + a.angularVelocity * rAx;
          const vcBx = b.vx - b.angularVelocity * rBy;
          const vcBy = b.vy + b.angularVelocity * rBx;
          const relVt = (vcAx - vcBx) * tx + (vcAy - vcBy) * ty;

          // Friction impulse (clamped to Coulomb cone)
          const friction = 0.4;
          const rACrossT = rAx * ty - rAy * tx;
          const rBCrossT = rBx * ty - rBy * tx;
          const jt =
            -relVt /
            (1 / a.mass +
              1 / b.mass +
              (rACrossT * rACrossT) / a.inertia +
              (rBCrossT * rBCrossT) / b.inertia);
          const jtClamped =
            Math.abs(jt) > friction * j ? Math.sign(jt) * friction * j : jt;

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
    }
  }
}
