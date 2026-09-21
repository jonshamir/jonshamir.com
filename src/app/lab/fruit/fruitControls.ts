import type { InferValues, Schema } from "../../../lib/tweakpane";

// Tension handles past ~1.2 make the profile overshoot its own radius and
// self-intersect, so the sliders stop short of it.
export const shapeSchema = {
  height: { value: 2, min: 0.5, max: 4, step: 0.01, label: "Height" },
  radius: { value: 1, min: 0.2, max: 2, step: 0.01, label: "Radius" },
  bulge: { value: 0.42, min: 0.05, max: 0.95, step: 0.01, label: "Bulge" },
  baseFlare: { value: 0.75, min: 0, max: 1.2, step: 0.01, label: "Base Flare" },
  bottomTension: {
    value: 0.55,
    min: 0,
    max: 1.2,
    step: 0.01,
    label: "Bottom Tension"
  },
  topTension: {
    value: 0.6,
    min: 0,
    max: 1.2,
    step: 0.01,
    label: "Top Tension"
  },
  tipFlare: { value: 0.8, min: 0, max: 1.2, step: 0.01, label: "Tip Flare" }
} satisfies Schema;

export const subdivisionSchema = {
  profileSegments: {
    value: 8,
    min: 3,
    max: 32,
    step: 1,
    label: "Spline"
  },
  radialSegments: {
    value: 16,
    min: 3,
    max: 32,
    step: 1,
    label: "Revolution"
  },
  wireframe: { value: false, label: "Wireframe" },
  // Slides vertices across the surface they already sit on, so the form is
  // untouched and only the tessellation moves. Measured in grid cells, so it
  // stays fold-safe as the segment counts change.
  jitterStrength: { value: 0, min: 0, max: 1, step: 0.01, label: "Jitter" },
  jitterScale: {
    value: 4,
    min: 0.5,
    max: 20,
    step: 0.1,
    label: "Jitter Scale"
  },
  jitterSeed: { value: 0, min: 0, max: 100, step: 1, label: "Jitter Seed" }
} satisfies Schema;

export const topSchema = {
  showTop: { value: true, label: "Show Top" },
  // "Segments" rather than "Revolutions": nothing revolves, and the body's
  // radialSegments under Subdivisions is already labelled "Revolution".
  topSegments: { value: 6, min: 3, max: 12, step: 1, label: "Segments" },
  // The cap as a cone about the fruit's tip: radius is apex to rim, angle
  // tilts that wall up from flat, offset slides the whole thing along the axis.
  // At ±90 the rim closes onto the axis and the cap vanishes to a needle.
  topRadius: { value: 0.54, min: 0.02, max: 2, step: 0.01, label: "Radius" },
  topAngle: { value: 0, min: -90, max: 90, step: 1, label: "Angle" },
  topOffset: { value: 0, min: -0.5, max: 0.5, step: 0.005, label: "Offset" },
  // How far each polygon of the cap reaches, as a fraction of the way from the
  // apex to the ring, at its centreline and at the edge it shares with its
  // neighbour. Both at 1 leave the cap whole; dropping Edge parts it into
  // petals, dropping Center notches each one. Sharpness bends the ramp between.
  topShapeCenter: {
    value: 1,
    min: 0,
    max: 1,
    step: 0.01,
    label: "Shape Center"
  },
  topShapeEdge: { value: 1, min: 0, max: 1, step: 0.01, label: "Shape Edge" },
  topShapeSharpness: {
    value: 1,
    min: 0.2,
    max: 8,
    step: 0.05,
    label: "Shape Sharpness"
  }
} satisfies Schema;

// Radians per second, off at 0. The light is fixed in world space, so the spin
// sweeps the bands across the fruit rather than turning a static image.
export const motionSchema = {
  rotationSpeed: {
    value: 0,
    min: 0,
    max: 2,
    step: 0.01,
    label: "Rotation"
  }
} satisfies Schema;

export const shadingSchema = {
  bands: { value: 3, min: 1, max: 16, step: 1, label: "Bands" },
  ambient: { value: 0.15, min: 0, max: 1, step: 0.01, label: "Ambient" },
  specCut: { value: 0.8, min: 0, max: 1, step: 0.01, label: "Spec Cutoff" },
  specPower: { value: 40, min: 1, max: 256, step: 1, label: "Spec Power" },
  specStrength: {
    value: 0.6,
    min: 0,
    max: 2,
    step: 0.01,
    label: "Spec Strength"
  },
  lightYaw: { value: 35, min: -180, max: 180, step: 1, label: "Light Yaw" },
  lightPitch: { value: 40, min: -89, max: 89, step: 1, label: "Light Pitch" }
} satisfies Schema;

// Dither plus splatter, each off at 0. The dither feeds every threshold below
// it, so raising it roughens the band edges, the blob outlines and the specular
// cut together.
export const grainSchema = {
  // Anchored to the surface: cycles per unit, so bigger is finer and the
  // pattern grows with the fruit.
  objectDitherStrength: {
    value: 0.5,
    min: 0,
    max: 1,
    step: 0.01,
    label: "Object Dither"
  },
  objectDitherScale: {
    value: 60,
    min: 0.5,
    max: 150,
    step: 0.5,
    label: "Object Scale"
  },
  // A pixel offset rather than a strength: the specular term is nearly binary,
  // so the cut has to be broken up in screen space to read as speckle.
  specDither: {
    value: 32,
    min: 0,
    max: 128,
    step: 0.5,
    label: "Spec Dither"
  },
  splatterStrength: {
    value: 0.6,
    min: 0,
    max: 1,
    step: 0.01,
    label: "Splatter"
  },
  splatterScale: {
    value: 16,
    min: 0.5,
    max: 40,
    step: 0.5,
    label: "Splatter Scale"
  },
  splatterCut: {
    value: 0.1,
    min: 0,
    max: 1,
    step: 0.01,
    label: "Splatter Cutoff"
  },
  splatterSoftness: {
    value: 0.05,
    min: 0,
    max: 0.5,
    step: 0.005,
    label: "Splatter Softness"
  }
} satisfies Schema;

export const colorSchema = {
  bodyLight: { value: "#e8503a", label: "Body Light" },
  bodyShadow: { value: "#7c2340", label: "Body Shadow" },
  topLight: { value: "#7cb342", label: "Top Light" },
  topShadow: { value: "#33561f", label: "Top Shadow" },
  splatter: { value: "#672300", label: "Splatter" },
  specular: { value: "#ffffff", label: "Specular" }
} satisfies Schema;

export type ShapeControls = InferValues<typeof shapeSchema>;
export type SubdivisionControls = InferValues<typeof subdivisionSchema>;
export type TopControls = InferValues<typeof topSchema>;
// Uniforms, not geometry inputs: split out so changing them never rebuilds the
// mesh.
export type TopShapeControls = Pick<
  TopControls,
  "topShapeCenter" | "topShapeEdge" | "topShapeSharpness"
>;
export type MotionControls = InferValues<typeof motionSchema>;
export type ShadingControls = InferValues<typeof shadingSchema>;
export type GrainControls = InferValues<typeof grainSchema>;
export type ColorControls = InferValues<typeof colorSchema>;
