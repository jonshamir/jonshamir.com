import {
  type ControlUniforms,
  type ControlValues,
  defineShaderControls
} from "../../../lib/shaderControls";

export const TOPO_SCHEMA = {
  baseAmplitude: {
    folder: "base",
    label: "Amplitude",
    value: 0.38,
    min: 0,
    max: 0.5,
    step: 0.005
  },
  baseFrequency: {
    folder: "base",
    label: "Frequency",
    value: 1.5,
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
    value: 0.21,
    min: 0,
    max: 1,
    step: 0.01
  },
  creaseRounding: {
    folder: "shape",
    label: "Crease rounding",
    value: 0.37,
    min: 0,
    max: 1,
    step: 0.01
  },
  erosionCellScale: {
    folder: "shape",
    label: "Cell scale",
    value: 0.45,
    min: 0.3,
    max: 1.5,
    step: 0.01
  },
  erosionNormalization: {
    folder: "shape",
    label: "Normalization",
    value: 0.35,
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
  lineCount: {
    folder: "contours",
    label: "Line count",
    value: 80,
    min: 1,
    max: 100,
    step: 1
  },
  majorEvery: {
    folder: "contours",
    label: "Major every",
    value: 5,
    min: 1,
    max: 20,
    step: 1
  },
  minorStrength: {
    folder: "contours",
    label: "Minor strength",
    value: 0.5,
    min: 0,
    max: 1,
    step: 0.01
  },
  contourSmoothing: {
    folder: "contours",
    label: "Smoothing",
    value: 1.0,
    min: 0,
    max: 1,
    step: 0.01
  },
  contourOffset: {
    folder: "contours",
    label: "Offset",
    value: 0.0,
    min: 0,
    max: 1,
    step: 0.01
  }
} as const;

const topo = defineShaderControls(TOPO_SCHEMA);

export type TopoControls = ControlValues<typeof TOPO_SCHEMA>;
export type TopoUniforms = ControlUniforms<typeof TOPO_SCHEMA>;

export const TOPO_DEFAULTS = topo.defaults;
export const TOPO_INITIAL_UNIFORMS = topo.initialUniforms;
export const createTopoUniforms = topo.createUniforms;
export const syncLevaToUniforms = topo.sync;
export const forwardToMaterial = topo.forwardToMaterial;
export const buildLevaSchema = topo.buildLevaSchema;
