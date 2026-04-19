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

export const TerrainMaterial = shaderMaterial(
  initialUniforms,
  /* glsl */ `
    varying vec3 vNormalW;
    varying float vHeight;

    ${erosionShaderChunk}

    void main() {
      vec3 ht = erodedTerrain(uv);
      float h = ht.x;
      vec3 displaced = position + vec3(0.0, 0.0, h * uDisplacementScale);

      // Plane is 2x2 in XY, uv in [0,1], so d(position.xy)/d(uv) = (2, 2).
      // Height world-derivative = (duv-derivative / 2) * uDisplacementScale.
      float s = uDisplacementScale * 0.5;
      vec3 n = normalize(vec3(-ht.y * s, -ht.z * s, 1.0));

      vNormalW = normalize(mat3(modelMatrix) * n);
      vHeight = h;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `,
  /* glsl */ `
    varying vec3 vNormalW;
    varying float vHeight;

    void main() {
      vec3 lightDir = normalize(vec3(0.4, 0.6, 0.7));
      float lambert = clamp(dot(normalize(vNormalW), lightDir), 0.0, 1.0);
      float ambient = 0.25;
      vec3 base = mix(vec3(0.72, 0.72, 0.72), vec3(0.98, 0.98, 0.98), clamp(vHeight * 1.5 + 0.2, 0.0, 1.0));
      vec3 color = base * (ambient + (1.0 - ambient) * lambert);
      gl_FragColor = vec4(color, 1.0);
    }
  `
);
