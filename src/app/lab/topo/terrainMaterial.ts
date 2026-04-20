import { shaderMaterial } from "@react-three/drei";
import type * as THREE from "three";

import { erosionShaderChunk } from "./erosionShader";
import { TOPO_INITIAL_UNIFORMS } from "./uniforms";

export const TerrainMaterial = shaderMaterial(
  {
    ...TOPO_INITIAL_UNIFORMS,
    uHeightMap: null as unknown as THREE.Texture,
    uLineColor: [0, 0, 0] as [number, number, number],
    uBgColor: [1, 1, 1] as [number, number, number]
  },
  /* glsl */ `
    uniform float uDisplacementScale;
    varying float vHeight;
    varying vec2 vUv;

    ${erosionShaderChunk}

    void main() {
      // Normals are computed per-fragment from the baked heightmap, so the
      // vertex stage only needs the height for displacement and for vHeight.
      float h = erodedTerrain(uv).x;
      vec3 displaced = position + vec3(0.0, 0.0, h * uDisplacementScale);
      vHeight = h;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `,
  /* glsl */ `
    // modelMatrix is auto-provided in the vertex stage but not the fragment
    // stage; declaring it here lets three.js bind the same per-draw value.
    uniform mat4 modelMatrix;
    uniform float uDisplacementScale;
    varying float vHeight;
    varying vec2 vUv;

    uniform sampler2D uHeightMap;
    uniform float uLineCount;
    uniform float uMajorEvery;
    uniform float uMinorStrength;
    uniform float uContourSmoothing;
    uniform float uContourOffset;
    uniform vec3 uLineColor;
    uniform vec3 uBgColor;

    // Same 2x2-packed supersample trick as the 2D contour pass — averaging
    // the four channels gives a smoother height for the contour math.
    float sampleHeight(vec2 uv) {
      vec4 s = texture2D(uHeightMap, uv);
      return (s.r + s.g + s.b + s.a) * 0.25;
    }

    void main() {
      // Per-fragment normal from the baked heightmap. The UV offset scales
      // with the on-screen pixel footprint via fwidth(vUv), so shading
      // sharpens when zoomed in and smooths out when zoomed out instead of
      // aliasing or blurring at a fixed rate.
      vec2 e = fwidth(vUv);
      float hL = sampleHeight(vUv - vec2(e.x, 0.0));
      float hR = sampleHeight(vUv + vec2(e.x, 0.0));
      float hD = sampleHeight(vUv - vec2(0.0, e.y));
      float hU = sampleHeight(vUv + vec2(0.0, e.y));
      float dhdu = (hR - hL) / (2.0 * e.x);
      float dhdv = (hU - hD) / (2.0 * e.y);
      // Plane is 2 units wide per 1 UV in each axis.
      float ns = uDisplacementScale * 0.5;
      vec3 nLocal = normalize(vec3(-dhdu * ns, -dhdv * ns, 1.0));
      vec3 nW = normalize(mat3(modelMatrix) * nLocal);

      vec3 lightDir = normalize(vec3(0.4, 0.6, 0.7));
      float lambert = clamp(dot(nW, lightDir), 0.0, 1.0);
      float ambient = 0.25;
      // Albedo follows the CSS background color, with a small height-based
      // lift toward the line (text) color so peaks read against the page.
      float heightTint = clamp(vHeight * 1.5 + 0.2, 0.0, 1.0);
      vec3 base = mix(uBgColor * 0.85, mix(uBgColor, uLineColor, 0.15), heightTint);
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
