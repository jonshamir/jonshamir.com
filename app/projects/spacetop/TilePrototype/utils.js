export class Rect {
  constructor(x, y, w, h) {
    if (x instanceof Rect) this.copy(x);
    else {
      this.x = x || 0;
      this.y = y || 0;
      this.w = w || 0;
      this.h = h || 0;
    }
  }

  isColliding(rect, padding) {
    if (!padding) padding = 0;
    return this.xOverlap(rect, padding) && this.yOverlap(rect, padding);
  }

  xOverlap(rect, padding) {
    if (!padding) padding = 0;
    return intervalsOverlap(
      this.l - padding,
      this.r + padding,
      rect.l - padding,
      rect.r + padding
    );
  }

  yOverlap(rect, padding) {
    if (!padding) padding = 0;
    return intervalsOverlap(
      this.t - padding,
      this.b + padding,
      rect.t - padding,
      rect.b + padding
    );
  }

  xContains(x) {
    return x > this.l && x < this.r;
  }

  yContains(y) {
    return y > this.t && y < this.b;
  }

  copy(r) {
    this.x = r.x;
    this.y = r.y;
    this.h = r.h;
    this.w = r.w;
  }

  area() {
    return this.w * this.h;
  }

  centerSqrDist(rect) {
    return Math.abs(this.cX - rect.cX) + Math.abs(this.cY - rect.cY);
  }

  // Center
  get cX() {
    return this.x + this.w / 2;
  }
  set cX(cX) {
    const diff = this.cX - cX;
    this.x -= diff;
  }
  get cY() {
    return this.y + this.h / 2;
  }
  set cY(cY) {
    const diff = this.cY - cY;
    this.y -= diff;
  }
  get c() {
    return { x: this.cX, y: this.cY };
  }

  getEdge(dir) {
    if (dir === TOP) return this.t;
    if (dir === BOTTOM) return this.b;
    if (dir === LEFT) return this.l;
    if (dir === RIGHT) return this.r;
  }

  setEdge(dir, value) {
    if (dir === TOP) this.t = value;
    if (dir === BOTTOM) this.b = value;
    if (dir === LEFT) this.l = value;
    if (dir === RIGHT) this.r = value;
  }

  resizeEdge(dir, value) {
    if (dir === TOP) this.resizeT(value);
    if (dir === BOTTOM) this.resizeB(value);
    if (dir === LEFT) this.resizeL(value);
    if (dir === RIGHT) this.resizeR(value);
  }

  // Top
  get t() {
    return this.y;
  }
  set t(t) {
    this.y = t;
  }
  resizeT(t) {
    const diff = this.y - t;
    this.y = t;
    this.h += diff;
  }

  // Right
  get r() {
    return this.x + this.w;
  }
  set r(r) {
    this.x = r - this.w;
  }
  resizeR(r) {
    const diff = r - this.r;
    this.w += diff;
  }

  // Bottom
  get b() {
    return this.y + this.h;
  }
  set b(b) {
    this.y = b - this.h;
  }
  resizeB(b) {
    const diff = b - this.b;
    this.h += diff;
  }

  // Left
  get l() {
    return this.x;
  }
  set l(l) {
    this.x = l;
  }
  resizeL(l) {
    const diff = this.x - l;
    this.x = l;
    this.w += diff;
  }
}

// Returns signed overlap of ranges assuming (a1 < b1) and (a2 < b2)
export function intervalsOverlap(a1, b1, a2, b2) {
  if (a1 < b2 && a2 < b1) return true;
  return false;
}

export const TOP = 0;
export const BOTTOM = 1;
export const LEFT = 2;
export const RIGHT = 3;
export const DIRS = [TOP, BOTTOM, LEFT, RIGHT];
export const HORIZONTAL = 0;
export const VERTICAL = 1;

export function clockwiseDir(dir) {
  switch (dir) {
    case TOP:
      return RIGHT;
    case RIGHT:
      return BOTTOM;
    case BOTTOM:
      return LEFT;
    case LEFT:
      return TOP;
  }
}

export function counterClockwiseDir(dir) {
  switch (dir) {
    case TOP:
      return LEFT;
    case LEFT:
      return BOTTOM;
    case BOTTOM:
      return RIGHT;
    case RIGHT:
      return TOP;
  }
}

export function oppositeDir(dir) {
  switch (dir) {
    case TOP:
      return BOTTOM;
    case LEFT:
      return RIGHT;
    case BOTTOM:
      return TOP;
    case RIGHT:
      return LEFT;
  }
}

export function dirOrientation(dir) {
  if (dir === LEFT || dir === RIGHT) return HORIZONTAL;
  return VERTICAL;
}

export function dirSign(dir) {
  if (dir === TOP || dir === LEFT) return -1;
  return 1;
}

export function dirToString(dir) {
  switch (dir) {
    case TOP:
      return "TOP";
    case LEFT:
      return "LEFT";
    case BOTTOM:
      return "BOTTOM";
    case RIGHT:
      return "RIGHT";
  }
}
