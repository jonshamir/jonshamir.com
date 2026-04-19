import { shaderMaterial } from "@react-three/drei";

import { erosionShaderChunk } from "./erosionShader";

export const HeightmapMaterial = shaderMaterial(
  {
    uBaseAmplitude: 0.3,
    uBaseFrequency: 2.0,
    uBaseOctaves: 5,
    uDisplacementScale: 1.0
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
      // Remap roughly to [0,1] for display; exact mapping tuned in Task 6.
      float g = clamp(h * 1.5 + 0.5, 0.0, 1.0);
      gl_FragColor = vec4(vec3(g), 1.0);
    }
  `
);
