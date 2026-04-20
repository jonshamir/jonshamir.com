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

    ${erosionShaderChunk}

    void main() {
      float h = erodedTerrain(vUv).x;

      float scaled = h * uLineCount;
      float dist = abs(fract(scaled) - 0.5);
      float width = fwidth(scaled);
      float line = smoothstep(width, 0.0, dist - 0.5 + width);

      float majorScaled = scaled / max(uMajorEvery, 1.0);
      float majorDist = abs(fract(majorScaled) - 0.5);
      float majorWidth = fwidth(majorScaled);
      float major = smoothstep(majorWidth, 0.0, majorDist - 0.5 + majorWidth);

      vec3 bg = vec3(0.96, 0.94, 0.88);
      vec3 lineColor = vec3(0.2, 0.25, 0.3);
      vec3 col = mix(bg, lineColor, max(line * uMinorStrength, major));
      gl_FragColor = vec4(col, 1.0);
    }
  `
);
