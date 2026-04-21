import { shaderMaterial } from "@react-three/drei";
import type * as THREE from "three";

import { TOPO_INITIAL_UNIFORMS } from "./uniforms";

// Bake pass: horizon-based AO computed directly from the baked heightmap.
// For each texel we march N rays in UV space and record the maximum elevation
// angle relative to the center sample; sin(horizon) averaged across rays gives
// a view-independent occlusion factor. Output is written to the R channel
// (0 = fully occluded, 1 = fully open).
export const AoMaterial = shaderMaterial(
  {
    uHeightMap: null as unknown as THREE.Texture,
    uAoRadius: TOPO_INITIAL_UNIFORMS.uAoRadius,
    uAoStrength: TOPO_INITIAL_UNIFORMS.uAoStrength,
    uAoBias: TOPO_INITIAL_UNIFORMS.uAoBias
  },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    varying vec2 vUv;

    uniform sampler2D uHeightMap;
    uniform float uAoRadius;
    uniform float uAoStrength;
    uniform float uAoBias;

    // Plane is 2 world units per 1 UV in each axis; converting UV distance
    // to world distance makes the horizon angles correctly scaled.
    const float WORLD_PER_UV = 2.0;
    const int AO_DIRS = 6;
    const int AO_STEPS = 6;

    // Same 2x2-packed supersample decoding used everywhere else.
    float sampleHeight(vec2 uv) {
      vec4 s = texture2D(uHeightMap, uv);
      return (s.r + s.g + s.b + s.a) * 0.25;
    }

    // Cheap hash for per-texel jitter.
    float hash12(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    void main() {
      float h0 = sampleHeight(vUv);
      float jitter = hash12(vUv * 1024.0);
      float angleStep = 6.2831853 / float(AO_DIRS);
      float stepLen = uAoRadius / float(AO_STEPS);

      float occSum = 0.0;
      for (int d = 0; d < AO_DIRS; d++) {
        float a = (float(d) + jitter) * angleStep;
        vec2 dir = vec2(cos(a), sin(a));
        float horizonSin = 0.0;
        // Offset the starting step by a per-ray jitter so consecutive rays
        // don't all sample the same concentric rings.
        float phase = fract(jitter + float(d) * 0.37);
        for (int s = 0; s < AO_STEPS; s++) {
          float t = (float(s) + phase) * stepLen;
          if (t > uAoRadius) break;
          vec2 p = vUv + dir * t;
          // Clamp to the heightmap bounds so edge rays don't sample garbage.
          if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) break;
          float hi = sampleHeight(p);
          float dh = hi - h0 - uAoBias;
          // sin(atan2(dh, dist)) = dh / sqrt(dh^2 + dist^2)
          float distWorld = t * WORLD_PER_UV;
          float s2 = dh * dh + distWorld * distWorld;
          float sinAngle = dh / sqrt(max(s2, 1e-8));
          horizonSin = max(horizonSin, sinAngle);
        }
        occSum += max(horizonSin, 0.0);
      }

      float occlusion = occSum / float(AO_DIRS);
      float ao = 1.0 - clamp(occlusion * uAoStrength, 0.0, 1.0);
      gl_FragColor = vec4(ao, ao, ao, 1.0);
    }
  `
);
