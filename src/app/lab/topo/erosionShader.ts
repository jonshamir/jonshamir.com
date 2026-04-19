// Port of "Advanced Terrain Erosion Filter" by Rune Skovbo Johansen.
// Source: https://www.shadertoy.com/view/wXcfWn
// Blog: https://blog.runevision.com/2026/03/fast-and-gorgeous-erosion-filter.html
// License: Mozilla Public License 2.0.
//
// Exposes a single entry point:
//   vec3 erodedTerrain(vec2 uv) → (height, dHeight/du, dHeight/dv)
//
// Stripped from the original: animated parameter sweeps, tree placement,
// water, packing for the Buffer A → Image handoff, comparison slider,
// and the iChannel keyboard toggle. What remains is the pure erosion filter
// on top of an fBM base.
export const erosionShaderChunk = /* glsl */ `
  #ifndef TOPO_PI
  #define TOPO_PI 3.14159265358979
  #define TOPO_TAU 6.28318530717959
  #define topo_clamp01(x) clamp(x, 0.0, 1.0)
  #endif

  uniform float uBaseAmplitude;
  uniform float uBaseFrequency;
  uniform int uBaseOctaves;
  uniform float uBaseLacunarity;
  uniform float uBaseGain;

  uniform float uErosionScale;
  uniform float uErosionStrength;
  uniform float uErosionGullyWeight;
  uniform float uErosionDetail;
  uniform int uErosionOctaves;
  uniform float uErosionLacunarity;
  uniform float uErosionGain;

  uniform float uRidgeRounding;
  uniform float uCreaseRounding;
  uniform float uErosionCellScale;
  uniform float uErosionNormalization;

  uniform float uHeightOffset;

  vec2 topoHash(in vec2 x) {
    const vec2 k = vec2(0.3183099, 0.3678794);
    x = x * k + k.yx;
    return -1.0 + 2.0 * fract(16.0 * k * fract(x.x * x.y * (x.x + x.y)));
  }

  // Gradient noise with analytical derivatives.
  // From https://www.shadertoy.com/view/XdXBRH
  vec3 topoNoised(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
    vec2 ga = topoHash(i + vec2(0.0, 0.0));
    vec2 gb = topoHash(i + vec2(1.0, 0.0));
    vec2 gc = topoHash(i + vec2(0.0, 1.0));
    vec2 gd = topoHash(i + vec2(1.0, 1.0));
    float va = dot(ga, f - vec2(0.0, 0.0));
    float vb = dot(gb, f - vec2(1.0, 0.0));
    float vc = dot(gc, f - vec2(0.0, 1.0));
    float vd = dot(gd, f - vec2(1.0, 1.0));
    return vec3(
      va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * (va - vb - vc + vd),
      ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd)
        + du * (u.yx * (va - vb - vc + vd) + vec2(vb, vc) - va)
    );
  }

  // Phacelle Noise — cosine/sine pair aligned to a direction.
  // Copyright (c) 2025 Rune Skovbo Johansen, MPL 2.0.
  vec4 phacelleNoise(in vec2 p, vec2 normDir, float freq, float offset, float normalization) {
    vec2 sideDir = normDir.yx * vec2(-1.0, 1.0) * freq * TOPO_TAU;
    offset *= TOPO_TAU;
    vec2 pInt = floor(p);
    vec2 pFrac = fract(p);
    vec2 phaseDir = vec2(0.0);
    float weightSum = 0.0;
    for (int i = -1; i <= 2; i++) {
      for (int j = -1; j <= 2; j++) {
        vec2 gridOffset = vec2(i, j);
        vec2 gridPoint = pInt + gridOffset;
        vec2 randomOffset = topoHash(gridPoint) * 0.5;
        vec2 vectorFromCellPoint = pFrac - gridOffset - randomOffset;
        float sqrDist = dot(vectorFromCellPoint, vectorFromCellPoint);
        float weight = exp(-sqrDist * 2.0);
        weight = max(0.0, weight - 0.01111);
        weightSum += weight;
        float waveInput = dot(vectorFromCellPoint, sideDir) + offset;
        phaseDir += vec2(cos(waveInput), sin(waveInput)) * weight;
      }
    }
    vec2 interpolated = phaseDir / weightSum;
    float magnitude = sqrt(dot(interpolated, interpolated));
    magnitude = max(1.0 - normalization, magnitude);
    return vec4(interpolated / magnitude, sideDir);
  }

  float topoPowInv(float t, float power) {
    return 1.0 - pow(1.0 - topo_clamp01(t), power);
  }

  float topoEaseOut(float t) {
    float v = 1.0 - topo_clamp01(t);
    return 1.0 - v * v;
  }

  float topoSmoothStart(float t, float smoothing) {
    if (t >= smoothing) return t - 0.5 * smoothing;
    return 0.5 * t * t / smoothing;
  }

  vec2 topoSafeNormalize(vec2 n) {
    float l = length(n);
    return (abs(l) > 1e-10) ? (n / l) : n;
  }

  // Advanced Terrain Erosion Filter.
  // Copyright (c) 2025 Rune Skovbo Johansen, MPL 2.0.
  // Returns vec4(heightDelta, slopeDeltaX, slopeDeltaY, accumulatedMagnitude).
  vec4 erosionFilter(
    in vec2 p, vec3 heightAndSlope, float fadeTarget,
    float strength, float gullyWeight, float detail,
    vec4 rounding, vec4 onset, vec2 assumedSlope,
    float scale, int octaves, float lacunarity,
    float gain, float cellScale, float normalization
  ) {
    strength *= scale;
    fadeTarget = clamp(fadeTarget, -1.0, 1.0);
    vec3 inputHeightAndSlope = heightAndSlope;
    float freq = 1.0 / (scale * cellScale);
    float slopeLength = max(length(heightAndSlope.yz), 1e-10);
    float magnitude = 0.0;
    float roundingMult = 1.0;
    float roundingForInput = mix(rounding.y, rounding.x, topo_clamp01(fadeTarget + 0.5)) * rounding.z;
    float combiMask = topoEaseOut(topoSmoothStart(slopeLength * onset.x, roundingForInput * onset.x));
    vec2 gullySlope = mix(
      heightAndSlope.yz,
      heightAndSlope.yz / slopeLength * assumedSlope.x,
      assumedSlope.y
    );

    for (int i = 0; i < 12; i++) {
      if (i >= octaves) break;
      vec4 phacelle = phacelleNoise(p * freq, topoSafeNormalize(gullySlope), cellScale, 0.25, normalization);
      phacelle.zw *= -freq;
      float sloping = abs(phacelle.y);
      gullySlope += sign(phacelle.y) * phacelle.zw * strength * gullyWeight;

      vec3 gullies = vec3(phacelle.x, phacelle.y * phacelle.zw);
      vec3 fadedGullies = mix(vec3(fadeTarget, 0.0, 0.0), gullies * gullyWeight, combiMask);
      heightAndSlope += fadedGullies * strength;
      magnitude += strength;

      fadeTarget = fadedGullies.x;

      float roundingForOctave = mix(rounding.y, rounding.x, topo_clamp01(phacelle.x + 0.5)) * roundingMult;
      float newMask = topoEaseOut(topoSmoothStart(sloping * onset.y, roundingForOctave * onset.y));
      combiMask = topoPowInv(combiMask, detail) * newMask;

      strength *= gain;
      freq *= lacunarity;
      roundingMult *= rounding.w;
    }

    vec3 heightAndSlopeDelta = heightAndSlope - inputHeightAndSlope;
    return vec4(heightAndSlopeDelta, magnitude);
  }

  vec3 topoFractalNoise(vec2 p, float freq, int octaves, float lacunarity, float gain) {
    vec3 n = vec3(0.0);
    float nf = freq;
    float na = 1.0;
    for (int i = 0; i < 12; i++) {
      if (i >= octaves) break;
      n += topoNoised(p * nf) * na * vec3(1.0, nf, nf);
      na *= gain;
      nf *= lacunarity;
    }
    return n;
  }

  // Returns (height, dHeight/du, dHeight/dv) for uv in [0, 1].
  vec3 erodedTerrain(vec2 uv) {
    vec2 p = uv;

    vec3 n = topoFractalNoise(p, uBaseFrequency, uBaseOctaves, uBaseLacunarity, uBaseGain)
      * uBaseAmplitude;

    // Erosion fade target — -1 at valleys, 1 at peaks (overshoot is fine).
    float fadeTarget = clamp(n.x / max(uBaseAmplitude * 0.6, 1e-6), -1.0, 1.0);

    // Remap height from [-1, 1]-ish to [0, 1]-ish.
    n = n * 0.5 + vec3(0.5, 0.0, 0.0);

    vec4 rounding = vec4(uRidgeRounding, uCreaseRounding, 0.1, 2.0);
    vec4 onset = vec4(1.25, 1.25, 2.8, 1.5);
    vec2 assumedSlope = vec2(0.7, 1.0);

    vec4 h = erosionFilter(
      p, n, fadeTarget,
      uErosionStrength, uErosionGullyWeight, uErosionDetail,
      rounding, onset, assumedSlope,
      uErosionScale, uErosionOctaves, uErosionLacunarity,
      uErosionGain, uErosionCellScale, uErosionNormalization
    );

    float offset = uHeightOffset * h.w;
    float eroded = n.x + h.x + offset;
    vec2 slope = n.yz + h.yz;

    return vec3(eroded, slope);
  }
`;
