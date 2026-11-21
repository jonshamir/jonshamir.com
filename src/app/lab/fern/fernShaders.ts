export const splatVertex = /* glsl */ `
attribute vec4 iA;
attribute vec4 iB;
attribute vec4 iC;

uniform float uPad;

varying vec2 vLocal;
varying float vLen;
varying vec4 vB;
varying vec4 vC;

void main() {
  vec2 origin;
  vec2 frame;
  vec2 center;
  vec2 dir;
  vec2 halfSize;
  float len;

  if (iC.z > 0.5) {
    origin = iA.xy;
    len = iA.w;
    float curvature = iB.y;
    float bend = curvature * len;
    float chord = len;
    float sagitta = 0.0;
    if (abs(bend) > 1e-4) {
      chord = 2.0 * sin(0.5 * bend) / curvature;
      sagitta = (1.0 - cos(0.5 * bend)) / abs(curvature);
    }
    float chordAngle = iA.z + 0.5 * bend;
    dir = vec2(cos(chordAngle), sin(chordAngle));
    vec2 perp = vec2(-dir.y, dir.x);
    float r = iB.x + iB.z + uPad;
    center = origin + dir * 0.5 * chord - perp * sign(curvature) * 0.5 * sagitta;
    halfSize = vec2(0.5 * chord + r, 0.5 * sagitta + r);
    frame = vec2(cos(iA.z), sin(iA.z));
  } else {
    origin = iA.xy;
    vec2 axis = iA.zw - origin;
    len = length(axis);
    dir = len > 1e-6 ? axis / len : vec2(1.0, 0.0);
    float r = max(max(iB.x, iB.y), max(iB.z, iB.w)) + uPad;
    center = 0.5 * (origin + iA.zw);
    halfSize = vec2(0.5 * len + r, r);
    frame = dir;
  }

  vec2 perp = vec2(-dir.y, dir.x);
  vec2 world = center + dir * position.x * halfSize.x + perp * position.y * halfSize.y;

  vec2 rel = world - origin;
  vLocal = vec2(dot(rel, frame), dot(rel, vec2(-frame.y, frame.x)));
  vLen = len;
  vB = iB;
  vC = iC;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 0.0, 1.0);
}
`;

export const shapeFragment = /* glsl */ `
uniform float uK;
uniform float uCutoff;
uniform float uInner;
uniform float uMargin;
uniform float uTeeth;
uniform float uToothDepth;
uniform vec4 uEnvelope;

varying vec2 vLocal;
varying float vLen;
varying vec4 vB;
varying vec4 vC;

const float PI = 3.14159265;

float sdUnevenCapsule(vec2 p, float r1, float r2, float h) {
  p.x = abs(p.x);
  if (h < 1e-6) return length(p) - max(r1, r2);
  float b = clamp((r1 - r2) / h, -0.999, 0.999);
  float a = sqrt(1.0 - b * b);
  float k = dot(p, vec2(-b, a));
  if (k < 0.0) return length(p) - r1;
  if (k > a * h) return length(p - vec2(0.0, h)) - r2;
  return dot(p, vec2(a, b)) - r1;
}

float sdLink(vec2 p, float r1, float r2, float h) {
  p.x = abs(p.x);
  if (h < 1e-6) return length(p) - max(r1, r2);
  float b = clamp((r1 - r2) / h, -0.999, 0.999);
  float a = sqrt(1.0 - b * b);
  float k = dot(p, vec2(-b, a));
  if (k < 0.0 && vC.x < 0.5) return length(p) - r1;
  if (k > a * h && vC.y < 0.5) return length(p - vec2(0.0, h)) - r2;
  return dot(p, vec2(a, b)) - r1;
}

float segmentDistance() {
  float axis = sdLink(vLocal.yx, vB.z, vB.w, vLen);
  if (max(vB.x, vB.y) <= 0.0) return axis;
  return min(sdLink(vLocal.yx, vB.x, vB.y, vLen), axis);
}

float envelope(float t) {
  float tMax = uEnvelope.x;
  float base = uEnvelope.y;
  t = clamp(t, 0.0, 1.0);
  if (t < tMax) {
    float u = 1.0 - t / tMax;
    return base + (1.0 - base) * (1.0 - pow(u, uEnvelope.z));
  }
  float span = 1.0 - tMax;
  if (span <= 0.0) return 1.0;
  return 1.0 - pow(max((t - tMax) / span, 0.0), uEnvelope.w);
}

float stalkMask(float t) {
  float stalk = vC.x;
  return stalk > 0.0 ? smoothstep(stalk, stalk + 0.08, t) : 1.0;
}

float bladeWidth(float t) {
  return vB.x * envelope(t) * stalkMask(t);
}

float teeth(float t) {
  if (uMargin < 0.5) return 1.0;
  float x = t * uTeeth;
  float fade = smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.8, 1.0, t));
  float profile = uMargin < 1.5 ? 1.0 - abs(sin(PI * x)) : 1.0 - fract(x);
  return 1.0 - uToothDepth * fade * profile;
}

float boxDistance(float dx, float dy) {
  return length(max(vec2(dx, dy), 0.0)) + min(max(dx, dy), 0.0);
}

const int OUTLINE_SAMPLES = 16;
const int OUTLINE_REFINE = 8;

float marginWidth(float t) {
  return bladeWidth(t) * teeth(t);
}

float outlineDistance2(float t, vec2 p, float len) {
  vec2 q = p - vec2(t * len, marginWidth(t));
  return dot(q, q);
}

float sideDistance(vec2 p, float s, float w) {
  return length(vec2(p.x - s, p.y - clamp(p.y, 0.0, w)));
}

float bladeDistance() {
  float len = vLen;
  float curvature = vB.y;
  float s = vLocal.x;
  float v = vLocal.y;

  if (abs(curvature) > 1e-4) {
    float radius = 1.0 / curvature;
    vec2 q = vLocal - vec2(0.0, radius);
    vec2 b = vec2(0.0, -radius);
    float angle = atan(b.x * q.y - b.y * q.x, dot(b, q));
    s = angle * radius;
    v = sign(curvature) * (abs(radius) - length(q));
  }

  vec2 p = vec2(s, abs(v));
  float t = s / len;

  float axis = 1e5;
  if (vC.x > 0.0) {
    float tc = clamp(t, 0.0, 1.0);
    float r = vB.z * mix(1.0, vB.w, tc) * (1.0 - stalkMask(tc));
    axis = length(vec2(s - tc * len, p.y)) - r;
  }

  float bound = boxDistance(max(-s, s - len), p.y - vB.x);
  if (bound > uCutoff) return min(bound, axis);

  float best = 1e10;
  float bestT = 0.0;
  for (int i = 0; i <= OUTLINE_SAMPLES; i++) {
    float ti = float(i) / float(OUTLINE_SAMPLES);
    float d2 = outlineDistance2(ti, p, len);
    if (d2 < best) {
      best = d2;
      bestT = ti;
    }
  }

  float step = 1.0 / float(OUTLINE_SAMPLES);
  float lo = max(bestT - step, 0.0);
  float hi = min(bestT + step, 1.0);
  for (int j = 0; j < OUTLINE_REFINE; j++) {
    float m1 = mix(lo, hi, 0.382);
    float m2 = mix(lo, hi, 0.618);
    if (outlineDistance2(m1, p, len) < outlineDistance2(m2, p, len)) {
      hi = m2;
    } else {
      lo = m1;
    }
  }
  float dist = sqrt(min(best, outlineDistance2(0.5 * (lo + hi), p, len)));
  dist = min(dist, sideDistance(p, 0.0, marginWidth(0.0)));
  dist = min(dist, sideDistance(p, len, marginWidth(1.0)));

  bool inside = t >= 0.0 && t <= 1.0 && p.y < marginWidth(t);
  return min(inside ? -dist : dist, axis);
}

float jointWeight() {
  float blend = max(vC.w, 1e-6);
  float x = vLocal.x;
  float w = 1.0;
  if (vC.x > 0.5) w *= clamp(0.5 + 0.5 * x / blend, 0.0, 1.0);
  if (vC.y > 0.5) w *= clamp(0.5 + 0.5 * (vLen - x) / blend, 0.0, 1.0);
  return w;
}

void main() {
  bool blade = vC.z > 0.5;
  float d = blade ? bladeDistance() : segmentDistance();
  if (d > uCutoff) discard;
  float weight = blade ? 1.0 : jointWeight();
  gl_FragColor = vec4(weight * exp(-max(d, -uInner) / uK), 0.0, 0.0, 0.0);
}
`;

export const compositeVertex = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const compositeFragment = /* glsl */ `
uniform sampler2D uShape;
uniform float uK;
uniform float uPixel;
uniform vec3 uColor;

varying vec2 vUv;

void main() {
  float s = texture2D(uShape, vUv).r;
  float d = -uK * log(max(s, 1e-30));
  float alpha = 1.0 - smoothstep(-0.5 * uPixel, 0.5 * uPixel, d);
  gl_FragColor = vec4(uColor, alpha);
  #include <colorspace_fragment>
}
`;
