import type { GsplatModifier } from "@sparkjsdev/spark";
import { dyno, SplatMesh } from "@sparkjsdev/spark";

// "Fake turbulence" via iterated sin-domain warping (gmshaders.com/p/turbulence).
// Cheap, smoothly animated, gives the curling/swirling look of real turbulence
// without noise textures or expensive value noise.
//
// We post-process the raw vec3 output so the *length* of the displacement is
// bounded by 1 (i.e. it lives in the unit ball, not the unit cube). Without
// this, sin() output per-component biases displacements toward the AABB
// corners and the cloud spreads into a box rather than a sphere.
const turbulenceGlobals = `
vec3 spark_turbulence(vec3 p, float t) {
  // Iterated sin-domain warping (Xor / gmshaders.com) — chaotic vec3 in q.
  vec3 q = p;
  float a = 1.0;
  for (int i = 0; i < 4; i++) {
    q += sin(q.yzx + t) * a;
    q *= 2.0;
    a *= 0.5;
  }

  // Direction: three INDEPENDENT phase-offset samples. Reading sin() of the
  // same q for all three components correlates the signs and pushes the
  // displacement toward the (±1, ±1, ±1) corners of the unit cube. With
  // independent phases the components decorrelate and their joint distribution
  // approximates a small isotropic blob — normalize that to get a roughly
  // uniform direction on the sphere.
  vec3 raw = vec3(
    sin(q.x),
    sin(q.y + 17.93),
    sin(q.z - 21.71)
  );
  vec3 dir = raw / max(length(raw), 1e-5);

  // Magnitude: a fourth, independent scalar in [0, 1] derived from q + t.
  // Decoupling magnitude from direction means the displacement envelope is
  // a ball of radius 1, not the cube the per-component sin() naturally fills.
  float mag = 0.5 + 0.5 * sin(dot(q, vec3(0.31, 0.71, 1.13)) + t);

  return dir * mag;
}
`;

export type NoiseDistortion = {
  modifier: GsplatModifier;
  setSizeScale: (v: number) => void;
  setNoiseAmp: (v: number) => void;
  setNoiseFreq: (v: number) => void;
  setNoiseSpeed: (v: number) => void;
  setShapeStrength: (v: number) => void;
  setSizeUniformity: (v: number) => void;
  setNoiseRise: (v: number) => void;
};

// Spark GsplatModifier that perturbs splat centers with animated fake
// turbulence and scales splat size. Setters mutate the underlying uniforms
// directly so the GLSL pipeline only compiles once.
export function createNoiseDistortion(): NoiseDistortion {
  const sizeScale = dyno.dynoFloat(1.0, "uSizeScale");
  const noiseAmp = dyno.dynoFloat(0.0, "uNoiseAmp");
  const noiseFreq = dyno.dynoFloat(1.0, "uNoiseFreq");
  const noiseSpeed = dyno.dynoFloat(0.5, "uNoiseSpeed");
  const shapeStrength = dyno.dynoFloat(0.0, "uShapeStrength");
  const sizeUniformity = dyno.dynoFloat(0.0, "uSizeUniformity");
  // Upward "scroll" of the noise field, in world units / second of dynoTime.
  // Shifts the sample point along -Y over time so the turbulence pattern
  // appears to drift upward through the cloud (rising-smoke feel) while the
  // displacement magnitude stays bounded.
  const noiseRise = dyno.dynoFloat(0.0, "uNoiseRise");

  const modifier = dyno.dynoBlock(
    { gsplat: dyno.Gsplat },
    { gsplat: dyno.Gsplat },
    ({ gsplat }) => {
      if (!gsplat) throw new Error("noiseDistortion: missing gsplat input");

      const split = dyno.splitGsplat(gsplat).outputs;

      // SplatMesh.dynoTime is a global float uniform Spark updates each frame
      // from its render clock. Multiply by speed for a per-effect time scale.
      const animatedTime = dyno.mul(SplatMesh.dynoTime, noiseSpeed);

      // gmshaders.com/p/turbulence "fire": scroll the noise sample point
      // along -Y over time so the field appears to flow upward through the
      // static cloud. Each frame's tiny shift becomes a coherent upward
      // drift in each splat's displacement vector.
      const riseOffset = dyno.mul(SplatMesh.dynoTime, noiseRise);

      const distort = dyno.dyno({
        inTypes: {
          center: "vec3",
          freq: "float",
          amp: "float",
          time: "float",
          rise: "float"
        },
        outTypes: { center: "vec3" },
        inputs: {
          center: split.center,
          freq: noiseFreq,
          amp: noiseAmp,
          time: animatedTime,
          rise: riseOffset
        },
        globals: () => [turbulenceGlobals],
        statements: ({ inputs, outputs }) => [
          `vec3 sampleP = ${inputs.center} * ${inputs.freq} - vec3(0.0, ${inputs.rise}, 0.0);`,
          `${outputs.center} = ${inputs.center} + spark_turbulence(sampleP, ${inputs.time}) * ${inputs.amp};`
        ]
      });

      const sizedScales = dyno.mul(split.scales, sizeScale);

      // Two independent lerps:
      //  1. roundness: scales → vec3(perSplatMean) makes the Gaussian
      //     isotropic (circle from any view) while preserving its own size.
      //  2. uniformity: scales → vec3(globalSize) collapses all splats to
      //     the same size. Tied to sizeScale so the Splat Size slider still
      //     drives the rounded/uniform target.
      const roundScales = dyno.dyno({
        inTypes: {
          scales: "vec3",
          roundness: "float",
          uniformity: "float",
          size: "float"
        },
        outTypes: { scales: "vec3" },
        inputs: {
          scales: sizedScales,
          roundness: shapeStrength,
          uniformity: sizeUniformity,
          size: sizeScale
        },
        statements: ({ inputs, outputs }) => [
          `float m = (${inputs.scales}.x + ${inputs.scales}.y + ${inputs.scales}.z) / 3.0;`,
          `vec3 round = mix(${inputs.scales}, vec3(m), ${inputs.roundness});`,
          `${outputs.scales} = mix(round, vec3(0.01 * ${inputs.size}), ${inputs.uniformity});`
        ]
      });

      return {
        gsplat: dyno.combineGsplat({
          gsplat,
          center: distort.outputs.center,
          scales: roundScales.outputs.scales
        })
      };
    }
  ) as unknown as GsplatModifier;

  const setUniform = (d: ReturnType<typeof dyno.dynoFloat>, v: number) => {
    d.value = v;
    d.uniform.value = v;
  };

  return {
    modifier,
    setSizeScale: (v) => setUniform(sizeScale, v),
    setNoiseAmp: (v) => setUniform(noiseAmp, v),
    setNoiseFreq: (v) => setUniform(noiseFreq, v),
    setNoiseSpeed: (v) => setUniform(noiseSpeed, v),
    setShapeStrength: (v) => setUniform(shapeStrength, v),
    setSizeUniformity: (v) => setUniform(sizeUniformity, v),
    setNoiseRise: (v) => setUniform(noiseRise, v)
  };
}
