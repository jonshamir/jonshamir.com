import { shaderMaterial } from "@react-three/drei";

import { erosionShaderChunk } from "./erosionShader";
import { TOPO_DEFAULTS } from "./uniforms";

const initialUniforms = {
  uBaseAmplitude: TOPO_DEFAULTS.baseAmplitude,
  uBaseFrequency: TOPO_DEFAULTS.baseFrequency,
  uBaseOctaves: TOPO_DEFAULTS.baseOctaves,
  uBaseLacunarity: TOPO_DEFAULTS.baseLacunarity,
  uBaseGain: TOPO_DEFAULTS.baseGain,
  uErosionScale: TOPO_DEFAULTS.erosionScale,
  uErosionStrength: TOPO_DEFAULTS.erosionStrength,
  uErosionGullyWeight: TOPO_DEFAULTS.erosionGullyWeight,
  uErosionDetail: TOPO_DEFAULTS.erosionDetail,
  uErosionOctaves: TOPO_DEFAULTS.erosionOctaves,
  uErosionLacunarity: TOPO_DEFAULTS.erosionLacunarity,
  uErosionGain: TOPO_DEFAULTS.erosionGain,
  uRidgeRounding: TOPO_DEFAULTS.ridgeRounding,
  uCreaseRounding: TOPO_DEFAULTS.creaseRounding,
  uErosionCellScale: TOPO_DEFAULTS.erosionCellScale,
  uErosionNormalization: TOPO_DEFAULTS.erosionNormalization,
  uHeightOffset: TOPO_DEFAULTS.heightOffset,
  uDisplacementScale: TOPO_DEFAULTS.displacementScale
};

export const HeightmapMaterial = shaderMaterial(
  initialUniforms,
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
