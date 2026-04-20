import { shaderMaterial } from "@react-three/drei";
import type * as THREE from "three";

import { erosionShaderChunk } from "./erosionShader";
import { TOPO_INITIAL_UNIFORMS } from "./uniforms";

export const TerrainMaterial = shaderMaterial(
  {
    ...TOPO_INITIAL_UNIFORMS,
    uHeightMap: null as unknown as THREE.Texture,
    uLineColor: [0, 0, 0] as [number, number, number]
  },
  /* glsl */ `
    uniform float uDisplacementScale;
    varying vec3 vNormalW;
    varying float vHeight;
    varying vec2 vUv;

    ${erosionShaderChunk}

    void main() {
      // Finite-difference the height rather than using the filter's analytical
      // gradient. The gradient output is inconsistent with the height field
      // because the masking/fade logic propagates derivatives naively — the
      // Shadertoy works around this the same way (sampling neighbor heights).
      float eps = 1.0 / 256.0;
      float h  = erodedTerrain(uv).x;
      float hx = erodedTerrain(uv + vec2(eps, 0.0)).x;
      float hy = erodedTerrain(uv + vec2(0.0, eps)).x;

      vec3 displaced = position + vec3(0.0, 0.0, h * uDisplacementScale);

      // Plane is 2x2 in XY, uv in [0,1], so d(position.xy)/d(uv) = (2, 2).
      float dhdu = (hx - h) / eps;
      float dhdv = (hy - h) / eps;
      float s = uDisplacementScale * 0.5;
      vec3 n = normalize(vec3(-dhdu * s, -dhdv * s, 1.0));

      vNormalW = normalize(mat3(modelMatrix) * n);
      vHeight = h;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `,
  /* glsl */ `
    varying vec3 vNormalW;
    varying float vHeight;
    varying vec2 vUv;

    uniform sampler2D uHeightMap;
    uniform float uLineCount;
    uniform float uMajorEvery;
    uniform float uMinorStrength;
    uniform float uContourSmoothing;
    uniform float uContourOffset;
    uniform vec3 uLineColor;

    // Same 2x2-packed supersample trick as the 2D contour pass — averaging
    // the four channels gives a smoother height for the contour math.
    float sampleHeight(vec2 uv) {
      vec4 s = texture2D(uHeightMap, uv);
      return (s.r + s.g + s.b + s.a) * 0.25;
    }

    void main() {
      // Base shaded terrain.
      vec3 lightDir = normalize(vec3(0.4, 0.6, 0.7));
      float lambert = clamp(dot(normalize(vNormalW), lightDir), 0.0, 1.0);
      float ambient = 0.25;
      vec3 base = mix(vec3(0.72, 0.72, 0.72), vec3(0.98, 0.98, 0.98), clamp(vHeight * 1.5 + 0.2, 0.0, 1.0));
      vec3 shaded = base * (ambient + (1.0 - ambient) * lambert);

      // Contour overlay (mirrors ContourMaterial's math, sampling the same
      // baked heightmap texture so 2D and 3D views stay in sync).
      float h = sampleHeight(vUv);
      if (uContourSmoothing > 0.0) {
        float o = uContourSmoothing * 0.004;
        float ss =
          sampleHeight(vUv + vec2( o, 0.0)) +
          sampleHeight(vUv + vec2(-o, 0.0)) +
          sampleHeight(vUv + vec2(0.0,  o)) +
          sampleHeight(vUv + vec2(0.0, -o)) +
          sampleHeight(vUv + vec2( o,  o)) +
          sampleHeight(vUv + vec2(-o,  o)) +
          sampleHeight(vUv + vec2( o, -o)) +
          sampleHeight(vUv + vec2(-o, -o));
        h = (h + ss) / 9.0;
      }

      float scaled = h * uLineCount - uContourOffset;
      float f = fract(scaled);
      float dist = min(f, 1.0 - f);
      float fw = max(length(vec2(dFdx(scaled), dFdy(scaled))), 1e-5);

      float minor = 1.0 - smoothstep(fw * 0.5, fw * 1.5, dist);

      float nearestInt = floor(scaled + 0.5);
      float every = max(uMajorEvery, 1.0);
      float majorMask = step(abs(mod(nearestInt + 0.5, every) - 0.5), 0.5);
      float major = (1.0 - smoothstep(fw * 1.5, fw * 3.0, dist)) * majorMask;

      float contourAlpha = max(minor * uMinorStrength, major);

      vec3 color = mix(shaded, uLineColor, contourAlpha);
      gl_FragColor = vec4(color, 1.0);
    }
  `
);
