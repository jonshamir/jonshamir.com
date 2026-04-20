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

    ${erosionShaderChunk}

    void main() {
      float h = erodedTerrain(vUv).x;
      float g = clamp(h, 0.0, 1.0);
      gl_FragColor = vec4(vec3(g), 1.0);
    }
  `
);
