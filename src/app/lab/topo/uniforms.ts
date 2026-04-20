import { folder } from "leva";
import * as THREE from "three";

type ParamSpec = {
  folder: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
};

export const TOPO_SCHEMA = {
  baseAmplitude: {
    folder: "base",
    label: "Amplitude",
    value: 0.125,
    min: 0,
    max: 0.5,
    step: 0.005
  },
  baseFrequency: {
    folder: "base",
    label: "Frequency",
    value: 3.0,
    min: 0.1,
    max: 20,
    step: 0.1
  },
  baseOctaves: {
    folder: "base",
    label: "Octaves",
    value: 3,
    min: 1,
    max: 10,
    step: 1
  },
  baseLacunarity: {
    folder: "base",
    label: "Lacunarity",
    value: 2.0,
    min: 1,
    max: 4,
    step: 0.05
  },
  baseGain: {
    folder: "base",
    label: "Gain",
    value: 0.5,
    min: 0,
    max: 1,
    step: 0.01
  },
  erosionScale: {
    folder: "erosion",
    label: "Scale",
    value: 0.15,
    min: 0.02,
    max: 0.5,
    step: 0.005
  },
  erosionStrength: {
    folder: "erosion",
    label: "Strength",
    value: 0.22,
    min: 0,
    max: 1,
    step: 0.005
  },
  erosionGullyWeight: {
    folder: "erosion",
    label: "Gully weight",
    value: 0.5,
    min: 0,
    max: 1,
    step: 0.01
  },
  erosionDetail: {
    folder: "erosion",
    label: "Detail",
    value: 1.5,
    min: 0.1,
    max: 4,
    step: 0.05
  },
  erosionOctaves: {
    folder: "erosion",
    label: "Octaves",
    value: 5,
    min: 1,
    max: 10,
    step: 1
  },
  erosionLacunarity: {
    folder: "erosion",
    label: "Lacunarity",
    value: 2.0,
    min: 1,
    max: 4,
    step: 0.05
  },
  erosionGain: {
    folder: "erosion",
    label: "Gain",
    value: 0.5,
    min: 0,
    max: 1,
    step: 0.01
  },
  ridgeRounding: {
    folder: "shape",
    label: "Ridge rounding",
    value: 0.1,
    min: 0,
    max: 1,
    step: 0.01
  },
  creaseRounding: {
    folder: "shape",
    label: "Crease rounding",
    value: 0.0,
    min: 0,
    max: 1,
    step: 0.01
  },
  erosionCellScale: {
    folder: "shape",
    label: "Cell scale",
    value: 0.7,
    min: 0.3,
    max: 1.5,
    step: 0.01
  },
  erosionNormalization: {
    folder: "shape",
    label: "Normalization",
    value: 0.5,
    min: 0,
    max: 1,
    step: 0.01
  },
  heightOffset: {
    folder: "shape",
    label: "Height offset",
    value: -0.65,
    min: -1,
    max: 1,
    step: 0.01
  },
  displacementScale: {
    folder: "rendering",
    label: "Displacement",
    value: 1.0,
    min: 0,
    max: 3,
    step: 0.05
  }
} as const satisfies Record<string, ParamSpec>;

export type TopoControls = { [K in keyof typeof TOPO_SCHEMA]: number };

type UniformName<K extends string> = `u${Capitalize<K>}`;
export type TopoUniforms = {
  [K in keyof typeof TOPO_SCHEMA as UniformName<
    K & string
  >]: THREE.IUniform<number>;
};

const CONTROL_KEYS = Object.keys(TOPO_SCHEMA) as (keyof TopoControls)[];
const toUniformName = <K extends string>(k: K) =>
  `u${k[0].toUpperCase()}${k.slice(1)}` as UniformName<K>;

export const TOPO_DEFAULTS = Object.fromEntries(
  CONTROL_KEYS.map((k) => [k, TOPO_SCHEMA[k].value])
) as TopoControls;

export const TOPO_INITIAL_UNIFORMS = Object.fromEntries(
  CONTROL_KEYS.map((k) => [toUniformName(k), TOPO_SCHEMA[k].value])
) as { [K in keyof typeof TOPO_SCHEMA as UniformName<K & string>]: number };

export function createTopoUniforms(): TopoUniforms {
  return Object.fromEntries(
    CONTROL_KEYS.map((k) => [toUniformName(k), { value: TOPO_SCHEMA[k].value }])
  ) as TopoUniforms;
}

export function syncLevaToUniforms(
  values: TopoControls,
  uniforms: TopoUniforms
) {
  for (const k of CONTROL_KEYS) {
    uniforms[toUniformName(k)].value = values[k];
  }
}

// Each shaderMaterial instance has its own uniform objects. Every frame we
// copy from the shared topo uniforms into the material's own uniforms map.
export function forwardToMaterial(
  uniforms: TopoUniforms,
  materialUniforms: { [key: string]: THREE.IUniform }
) {
  for (const k of CONTROL_KEYS) {
    const name = toUniformName(k);
    const mu = materialUniforms[name];
    if (mu) mu.value = uniforms[name].value;
  }
}

// Build the leva useControls schema, grouped by folder.
export function buildLevaSchema(): Record<string, ReturnType<typeof folder>> {
  const byFolder: Record<
    string,
    Record<string, Omit<ParamSpec, "folder">>
  > = {};
  for (const k of CONTROL_KEYS) {
    const { folder: f, ...rest } = TOPO_SCHEMA[k];
    (byFolder[f] ??= {})[k] = rest;
  }
  const out: Record<string, ReturnType<typeof folder>> = {};
  for (const [name, fields] of Object.entries(byFolder)) {
    out[name] = folder(fields);
  }
  return out;
}
