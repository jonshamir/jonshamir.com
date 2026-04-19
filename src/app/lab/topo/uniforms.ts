import * as THREE from "three";

export type TopoControls = {
  baseAmplitude: number;
  baseFrequency: number;
  baseOctaves: number;
  baseLacunarity: number;
  baseGain: number;
  erosionScale: number;
  erosionStrength: number;
  erosionGullyWeight: number;
  erosionDetail: number;
  erosionOctaves: number;
  erosionLacunarity: number;
  erosionGain: number;
  ridgeRounding: number;
  creaseRounding: number;
  erosionCellScale: number;
  erosionNormalization: number;
  heightOffset: number;
  displacementScale: number;
};

export type TopoUniforms = {
  uBaseAmplitude: THREE.IUniform<number>;
  uBaseFrequency: THREE.IUniform<number>;
  uBaseOctaves: THREE.IUniform<number>;
  uBaseLacunarity: THREE.IUniform<number>;
  uBaseGain: THREE.IUniform<number>;
  uErosionScale: THREE.IUniform<number>;
  uErosionStrength: THREE.IUniform<number>;
  uErosionGullyWeight: THREE.IUniform<number>;
  uErosionDetail: THREE.IUniform<number>;
  uErosionOctaves: THREE.IUniform<number>;
  uErosionLacunarity: THREE.IUniform<number>;
  uErosionGain: THREE.IUniform<number>;
  uRidgeRounding: THREE.IUniform<number>;
  uCreaseRounding: THREE.IUniform<number>;
  uErosionCellScale: THREE.IUniform<number>;
  uErosionNormalization: THREE.IUniform<number>;
  uHeightOffset: THREE.IUniform<number>;
  uDisplacementScale: THREE.IUniform<number>;
};

// Defaults mirror the Shadertoy's Heightmap() function values.
export const TOPO_DEFAULTS: TopoControls = {
  baseAmplitude: 0.125,
  baseFrequency: 3.0,
  baseOctaves: 3,
  baseLacunarity: 2.0,
  baseGain: 0.5,
  erosionScale: 0.15,
  erosionStrength: 0.22,
  erosionGullyWeight: 0.5,
  erosionDetail: 1.5,
  erosionOctaves: 5,
  erosionLacunarity: 2.0,
  erosionGain: 0.5,
  ridgeRounding: 0.1,
  creaseRounding: 0.0,
  erosionCellScale: 0.7,
  erosionNormalization: 0.5,
  heightOffset: -0.65,
  displacementScale: 1.0
};

export function createTopoUniforms(): TopoUniforms {
  return {
    uBaseAmplitude: { value: TOPO_DEFAULTS.baseAmplitude },
    uBaseFrequency: { value: TOPO_DEFAULTS.baseFrequency },
    uBaseOctaves: { value: TOPO_DEFAULTS.baseOctaves },
    uBaseLacunarity: { value: TOPO_DEFAULTS.baseLacunarity },
    uBaseGain: { value: TOPO_DEFAULTS.baseGain },
    uErosionScale: { value: TOPO_DEFAULTS.erosionScale },
    uErosionStrength: { value: TOPO_DEFAULTS.erosionStrength },
    uErosionGullyWeight: { value: TOPO_DEFAULTS.erosionGullyWeight },
    uErosionDetail: { value: TOPO_DEFAULTS.erosionDetail },
    uErosionOctaves: { value: TOPO_DEFAULTS.erosionOctaves },
    uErosionLacunarity: { value: TOPO_DEFAULTS.erosionLacunarity },
    uErosionGain: { value: TOPO_DEFAULTS.erosionGain },
    uRidgeRounding: { value: TOPO_DEFAULTS.ridgeRounding },
    uCreaseRounding: { value: TOPO_DEFAULTS.creaseRounding },
    uErosionCellScale: { value: TOPO_DEFAULTS.erosionCellScale },
    uErosionNormalization: { value: TOPO_DEFAULTS.erosionNormalization },
    uHeightOffset: { value: TOPO_DEFAULTS.heightOffset },
    uDisplacementScale: { value: TOPO_DEFAULTS.displacementScale }
  };
}

const UNIFORM_KEYS: Array<[keyof TopoControls, keyof TopoUniforms]> = [
  ["baseAmplitude", "uBaseAmplitude"],
  ["baseFrequency", "uBaseFrequency"],
  ["baseOctaves", "uBaseOctaves"],
  ["baseLacunarity", "uBaseLacunarity"],
  ["baseGain", "uBaseGain"],
  ["erosionScale", "uErosionScale"],
  ["erosionStrength", "uErosionStrength"],
  ["erosionGullyWeight", "uErosionGullyWeight"],
  ["erosionDetail", "uErosionDetail"],
  ["erosionOctaves", "uErosionOctaves"],
  ["erosionLacunarity", "uErosionLacunarity"],
  ["erosionGain", "uErosionGain"],
  ["ridgeRounding", "uRidgeRounding"],
  ["creaseRounding", "uCreaseRounding"],
  ["erosionCellScale", "uErosionCellScale"],
  ["erosionNormalization", "uErosionNormalization"],
  ["heightOffset", "uHeightOffset"],
  ["displacementScale", "uDisplacementScale"]
];

export function syncLevaToUniforms(
  values: TopoControls,
  uniforms: TopoUniforms
) {
  for (const [controlKey, uniformKey] of UNIFORM_KEYS) {
    uniforms[uniformKey].value = values[controlKey];
  }
}

// Each shaderMaterial instance has its own uniform objects. Every frame we
// copy from the shared topo uniforms into the material's own uniforms map.
export function forwardToMaterial(
  uniforms: TopoUniforms,
  materialUniforms: { [key: string]: THREE.IUniform }
) {
  for (const [, uniformKey] of UNIFORM_KEYS) {
    const mu = materialUniforms[uniformKey];
    if (mu) mu.value = uniforms[uniformKey].value;
  }
}
