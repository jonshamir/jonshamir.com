export const splatVertex = /* glsl */ `
attribute vec4 iA;
attribute vec4 iB;
attribute vec4 iC;
attribute vec4 iD;

uniform float uPad;

varying vec2 vLocal;
varying vec2 vPerp;
varying float vLen;
varying vec4 vB;
varying vec4 vC;
varying vec4 vD;

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
  vPerp = perp;
  vLen = len;
  vB = iB;
  vC = iC;
  vD = iD;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 0.0, 1.0);
}
`;

const field = /* glsl */ `
uniform float uPixel;
uniform float uK;
uniform float uMargin;
uniform float uToothDepth;

varying vec2 vLocal;
varying vec2 vPerp;
varying float vLen;
varying vec4 vB;
varying vec4 vC;
varying vec4 vD;

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

float segU() {
  return vLen > 1e-6 ? clamp(vLocal.x / vLen, 0.0, 1.0) : 0.0;
}

float arcLength() {
  return mix(vC.x, vC.y, segU());
}

float laminaWidth() {
  return mix(vB.x, vB.y, segU());
}

float axisDistance() {
  return sdUnevenCapsule(vLocal.yx, vB.z, vB.w, vLen);
}

float laminaDistance() {
  if (max(vB.x, vB.y) <= 0.0) return 1e5;
  float d = sdUnevenCapsule(vLocal.yx, vB.x, vB.y, vLen);

  if (vD.x > 0.5 && uMargin > 0.5 && vC.w > 0.0) {
    float s = arcLength();
    float x = s / vC.w;
    float sN = s / vD.y;
    float fade = smoothstep(0.0, 0.15, sN) * (1.0 - smoothstep(0.8, 1.0, sN));
    float profile = uMargin < 1.5
      ? 1.0 - abs(sin(PI * x))
      : 1.0 - fract(x);
    d += uToothDepth * laminaWidth() * fade * profile;
  }
  return d;
}
`;

export const shapeFragment = /* glsl */ `
${field}
uniform float uCutoff;
uniform float uInner;

void main() {
  float d = min(laminaDistance(), axisDistance());
  if (d > uCutoff) discard;
  gl_FragColor = vec4(exp(-max(d, -uInner) / uK), 0.0, 0.0, 0.0);
}
`;

export const attributeFragment = /* glsl */ `
${field}
uniform vec3 uLight;
uniform float uFold;
uniform float uVeinType;
uniform float uVeinAngle;
uniform float uForkAt;

const float FORK_SPREAD = 0.22;

float veinLine(float s, float spacing, float angle) {
  return abs(fract(s / spacing + 0.5) - 0.5) * spacing * sin(angle);
}

float veinMask(float dLam) {
  float spacing = vC.z;
  if (spacing <= 0.0 || dLam >= 0.0) return 0.0;

  float s = arcLength();
  float av = abs(vLocal.y);
  float w = laminaWidth();
  float cotA = 1.0 / tan(uVeinAngle);
  float dist = veinLine(s - av * cotA, spacing, uVeinAngle);

  float fork = uForkAt * w;
  if (uVeinType > 0.5 && av > fork) {
    float s0 = s - fork * cotA;
    float a1 = uVeinAngle - FORK_SPREAD;
    float a2 = uVeinAngle + FORK_SPREAD;
    float d1 = veinLine(s0 - (av - fork) / tan(a1), spacing, a1);
    float d2 = veinLine(s0 - (av - fork) / tan(a2), spacing, a2);
    dist = min(d1, d2);
  }

  float vw = vD.z;
  float line = 1.0 - smoothstep(0.5 * vw, 0.5 * vw + uPixel, dist);
  line *= clamp(vw / uPixel, 0.0, 1.0);
  return line * smoothstep(0.0, 2.0 * vw + uPixel, -dLam);
}

void main() {
  float dLam = laminaDistance();
  float dAxis = axisDistance();
  float d = min(dLam, dAxis);

  float cover = 1.0 - smoothstep(0.0, 2.0 * uK + uPixel, d);
  if (cover <= 0.0) discard;

  float axisMask = 1.0 - smoothstep(-0.5 * uPixel, 0.5 * uPixel, dAxis);
  float vein = veinMask(dLam);

  float tilt;
  if (dAxis < 0.0) {
    float r = max(mix(vB.z, vB.w, segU()), 1e-6);
    tilt = asin(clamp(vLocal.y / r, -1.0, 1.0));
  } else {
    float w = max(laminaWidth(), 1e-6);
    float side = vLocal.y >= 0.0 ? 1.0 : -1.0;
    tilt = side * uFold * (0.35 + 0.65 * clamp(abs(vLocal.y) / w, 0.0, 1.0));
  }
  vec3 n = vec3(vPerp * sin(tilt), cos(tilt));
  float shade = clamp(dot(n, uLight), 0.0, 1.0);

  gl_FragColor = vec4(axisMask, vein, shade, 1.0) * cover;
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
uniform sampler2D uAttr;
uniform float uK;
uniform float uPixel;
uniform float uOutline;
uniform float uBands;
uniform float uAmbient;
uniform float uShadow;
uniform vec2 uShadowOffset;
uniform vec3 uLeafLight;
uniform vec3 uLeafDark;
uniform vec3 uAxis;
uniform vec3 uVein;
uniform vec3 uOutlineColor;
uniform vec3 uShadowColor;

varying vec2 vUv;

float distanceAt(vec2 uv) {
  float s = texture2D(uShape, uv).r;
  return -uK * log(max(s, 1e-30));
}

void main() {
  float d = distanceAt(vUv);
  float alpha = 1.0 - smoothstep(-0.5 * uPixel, 0.5 * uPixel, d);

  float sd = distanceAt(vUv - uShadowOffset);
  float shadowAlpha = uShadow * (1.0 - smoothstep(-uPixel, 3.0 * uPixel, sd));

  vec4 attr = texture2D(uAttr, vUv);
  float shade = attr.a > 0.01 ? attr.b / attr.a : 0.5;
  float lit = clamp(uAmbient + (1.0 - uAmbient) * shade, 0.0, 1.0);
  if (uBands > 1.5) {
    lit = min(floor(lit * uBands), uBands - 1.0) / (uBands - 1.0);
  }

  vec3 color = mix(uLeafDark, uLeafLight, lit);
  color = mix(color, uVein, attr.g);
  color = mix(color, uAxis * (0.55 + 0.6 * lit), attr.r);

  if (uOutline > 0.0) {
    float w = uOutline * uPixel;
    float edge = smoothstep(-w - 0.5 * uPixel, -w + 0.5 * uPixel, d);
    color = mix(color, uOutlineColor, edge);
  }

  float outAlpha = alpha + shadowAlpha * (1.0 - alpha);
  vec3 outColor = (color * alpha + uShadowColor * shadowAlpha * (1.0 - alpha))
    / max(outAlpha, 1e-5);

  gl_FragColor = vec4(outColor, outAlpha);
  #include <colorspace_fragment>
}
`;
