import { shaderMaterial } from "@react-three/drei";
import type * as THREE from "three";

import { erosionShaderChunk } from "./erosionShader";
import { TOPO_INITIAL_UNIFORMS } from "./uniforms";

// Bake pass: evaluates the (expensive) erosion filter once and writes
// height into the red channel of an offscreen render target. Only declares
// the uniforms the erosion shader actually reads, so the dirty check in
// HeightmapQuad doesn't trigger a re-bake on contour-only slider changes.
export const HeightmapMaterial = shaderMaterial(
  {
    uBaseAmplitude: TOPO_INITIAL_UNIFORMS.uBaseAmplitude,
    uBaseFrequency: TOPO_INITIAL_UNIFORMS.uBaseFrequency,
    uBaseOctaves: TOPO_INITIAL_UNIFORMS.uBaseOctaves,
    uBaseLacunarity: TOPO_INITIAL_UNIFORMS.uBaseLacunarity,
    uBaseGain: TOPO_INITIAL_UNIFORMS.uBaseGain,
    uErosionScale: TOPO_INITIAL_UNIFORMS.uErosionScale,
    uErosionStrength: TOPO_INITIAL_UNIFORMS.uErosionStrength,
    uErosionGullyWeight: TOPO_INITIAL_UNIFORMS.uErosionGullyWeight,
    uErosionDetail: TOPO_INITIAL_UNIFORMS.uErosionDetail,
    uErosionOctaves: TOPO_INITIAL_UNIFORMS.uErosionOctaves,
    uErosionLacunarity: TOPO_INITIAL_UNIFORMS.uErosionLacunarity,
    uErosionGain: TOPO_INITIAL_UNIFORMS.uErosionGain,
    uRidgeRounding: TOPO_INITIAL_UNIFORMS.uRidgeRounding,
    uCreaseRounding: TOPO_INITIAL_UNIFORMS.uCreaseRounding,
    uErosionCellScale: TOPO_INITIAL_UNIFORMS.uErosionCellScale,
    uErosionNormalization: TOPO_INITIAL_UNIFORMS.uErosionNormalization,
    uHeightOffset: TOPO_INITIAL_UNIFORMS.uHeightOffset
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

    ${erosionShaderChunk}

    void main() {
      float h = erodedTerrain(vUv).x;
      gl_FragColor = vec4(h, 0.0, 0.0, 1.0);
    }
  `
);

// Display pass: reads the baked heightmap texture and draws contour lines.
// Cheap enough to run every frame.
export const ContourMaterial = shaderMaterial(
  {
    uHeightMap: null as unknown as THREE.Texture,
    uLineCount: TOPO_INITIAL_UNIFORMS.uLineCount,
    uMajorEvery: TOPO_INITIAL_UNIFORMS.uMajorEvery,
    uMinorStrength: TOPO_INITIAL_UNIFORMS.uMinorStrength,
    uContourSmoothing: TOPO_INITIAL_UNIFORMS.uContourSmoothing
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
    uniform float uLineCount;
    uniform float uMajorEvery;
    uniform float uMinorStrength;
    uniform float uContourSmoothing;

    float sampleHeight(vec2 uv) {
      return texture2D(uHeightMap, uv).r;
    }

    void main() {
      float h = sampleHeight(vUv);
      if (uContourSmoothing > 0.0) {
        // Slider is 0..1; cap actual UV offset at ~0.004 to stay below the
        // heightmap's high-frequency detail and avoid aliasing artifacts.
        float o = uContourSmoothing * 0.004;
        float s =
          sampleHeight(vUv + vec2( o, 0.0)) +
          sampleHeight(vUv + vec2(-o, 0.0)) +
          sampleHeight(vUv + vec2(0.0,  o)) +
          sampleHeight(vUv + vec2(0.0, -o)) +
          sampleHeight(vUv + vec2( o,  o)) +
          sampleHeight(vUv + vec2(-o,  o)) +
          sampleHeight(vUv + vec2( o, -o)) +
          sampleHeight(vUv + vec2(-o, -o));
        h = (h + s) / 9.0;
      }

      // Distance to nearest contour in "line index" units (0 at line, 0.5 between lines).
      float scaled = h * uLineCount;
      float f = fract(scaled);
      float dist = min(f, 1.0 - f);
      // True gradient magnitude (L2) rather than fwidth's L1 approximation,
      // so line thickness is uniform regardless of contour angle.
      float fw = max(length(vec2(dFdx(scaled), dFdy(scaled))), 1e-5);

      // Minor line: ~1px thick.
      float minor = 1.0 - smoothstep(fw * 0.5, fw * 1.5, dist);

      // Major line: same grid, but thicker and only on every Nth step.
      float nearestInt = floor(scaled + 0.5);
      float every = max(uMajorEvery, 1.0);
      float majorMask = step(abs(mod(nearestInt + 0.5, every) - 0.5), 0.5);
      float major = (1.0 - smoothstep(fw * 1.5, fw * 3.0, dist)) * majorMask;

      float alpha = max(minor * uMinorStrength, major);

      vec3 bg = vec3(0.96, 0.94, 0.88);
      vec3 lineColor = vec3(0.2, 0.25, 0.3);
      gl_FragColor = vec4(mix(bg, lineColor, alpha), 1.0);
    }
  `
);
