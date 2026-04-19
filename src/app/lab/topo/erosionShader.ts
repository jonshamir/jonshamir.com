// Placeholder during scaffolding. Replaced in Task 6 by the ported Shadertoy
// "Advanced Terrain Erosion Filter" source (view wXcfWn), exposing the same
// erodedTerrain(vec2 uv) entry point but with the real algorithm + uniforms.
export const erosionShaderChunk = /* glsl */ `
  uniform float uBaseAmplitude;
  uniform float uBaseFrequency;
  uniform int uBaseOctaves;

  // 2D hash
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Value noise
  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // Placeholder fBM-style height. Returns (height, dH/dx, dH/dy) where
  // gradients are finite-differenced — good enough to validate the pipeline.
  vec3 erodedTerrain(vec2 uv) {
    float freq = uBaseFrequency;
    float amp = uBaseAmplitude;
    float h = 0.0;
    for (int i = 0; i < 8; i++) {
      if (i >= uBaseOctaves) break;
      h += amp * valueNoise(uv * freq);
      freq *= 2.0;
      amp *= 0.5;
    }
    float eps = 1.0 / 512.0;
    float hx = 0.0;
    float hy = 0.0;
    {
      float f = uBaseFrequency; float a = uBaseAmplitude;
      for (int i = 0; i < 8; i++) {
        if (i >= uBaseOctaves) break;
        hx += a * valueNoise((uv + vec2(eps, 0.0)) * f);
        hy += a * valueNoise((uv + vec2(0.0, eps)) * f);
        f *= 2.0; a *= 0.5;
      }
    }
    return vec3(h, (hx - h) / eps, (hy - h) / eps);
  }
`;
