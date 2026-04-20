import { shaderMaterial } from "@react-three/drei";

import { erosionShaderChunk } from "./erosionShader";
import { TOPO_INITIAL_UNIFORMS } from "./uniforms";

export const HeightmapMaterial = shaderMaterial(
  { ...TOPO_INITIAL_UNIFORMS },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    varying vec2 vUv;

    uniform float uLineCount;
    uniform float uMajorEvery;
    uniform float uMinorStrength;
    uniform float uContourSmoothing;

    ${erosionShaderChunk}

    float sampleHeight(vec2 uv) {
      return erodedTerrain(uv).x;
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
      float fw = max(fwidth(scaled), 1e-5);

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
