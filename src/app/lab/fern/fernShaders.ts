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
  vec2 p0 = iA.xy;
  vec2 p1 = iA.zw;
  vec2 axis = p1 - p0;
  float len = length(axis);
  vec2 dir = len > 1e-6 ? axis / len : vec2(1.0, 0.0);
  vec2 perp = vec2(-dir.y, dir.x);

  float r = max(max(iB.x, iB.y), max(iB.z, iB.w)) + uPad;
  vec2 center = 0.5 * (p0 + p1);
  vec2 world = center
    + dir * position.x * (0.5 * len + r)
    + perp * position.y * r;

  vec2 rel = world - p0;
  vLocal = vec2(dot(rel, dir), dot(rel, perp));
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

float laminaDistance() {
  if (max(vB.x, vB.y) <= 0.0) return 1e5;
  float d = sdUnevenCapsule(vLocal.yx, vB.x, vB.y, vLen);

  if (vC.z > 0.5 && uMargin > 0.5) {
    float u = vLen > 1e-6 ? clamp(vLocal.x / vLen, 0.0, 1.0) : 0.0;
    float t = mix(vC.x, vC.y, u);
    float x = t * uTeeth;
    float fade = smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.8, 1.0, t));
    float profile = uMargin < 1.5
      ? 1.0 - abs(sin(PI * x))
      : 1.0 - fract(x);
    d += uToothDepth * mix(vB.x, vB.y, u) * fade * profile;
  }
  return d;
}

void main() {
  float axis = sdUnevenCapsule(vLocal.yx, vB.z, vB.w, vLen);
  float d = min(laminaDistance(), axis);
  if (d > uCutoff) discard;
  gl_FragColor = vec4(exp(-max(d, -uInner) / uK), 0.0, 0.0, 0.0);
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
