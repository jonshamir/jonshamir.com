import type { GsplatModifier } from "@sparkjsdev/spark";
import { dyno, SplatMesh } from "@sparkjsdev/spark";

// "Fake turbulence" via iterated sin-domain warping (gmshaders.com/p/turbulence).
// Cheap, smoothly animated, and gives the curling/swirling look of real
// turbulence without any noise textures or expensive value noise.
const turbulenceGlobals = `
vec3 spark_turbulence(vec3 p, float t) {
  // Iteratively advect p by sin of itself with a time offset.
  // Each iteration halves amplitude and doubles frequency for fractal detail.
  float amp = 1.0;
  for (int i = 0; i < 4; i++) {
    p += sin(p.yzx + t) * amp;
    p *= 2.0;
    amp *= 0.5;
  }
  // Map back to a smooth, bounded vec3 displacement in roughly [-1, 1].
  return sin(p);
}
`;

export type NoiseDistortion = {
  modifier: GsplatModifier;
  setSizeScale: (v: number) => void;
  setNoiseAmp: (v: number) => void;
  setNoiseFreq: (v: number) => void;
  setNoiseSpeed: (v: number) => void;
};

// Spark GsplatModifier that perturbs splat centers with animated fake
// turbulence and scales splat size. Setters mutate the underlying uniforms
// directly so the GLSL pipeline only compiles once.
export function createNoiseDistortion(): NoiseDistortion {
  const sizeScale = dyno.dynoFloat(1.0, "uSizeScale");
  const noiseAmp = dyno.dynoFloat(0.0, "uNoiseAmp");
  const noiseFreq = dyno.dynoFloat(1.0, "uNoiseFreq");
  const noiseSpeed = dyno.dynoFloat(0.5, "uNoiseSpeed");

  const modifier = dyno.dynoBlock(
    { gsplat: dyno.Gsplat },
    { gsplat: dyno.Gsplat },
    ({ gsplat }) => {
      if (!gsplat) throw new Error("noiseDistortion: missing gsplat input");

      const split = dyno.splitGsplat(gsplat).outputs;

      // SplatMesh.dynoTime is a global float uniform Spark updates each frame
      // from its render clock. Multiply by speed for a per-effect time scale.
      const animatedTime = dyno.mul(SplatMesh.dynoTime, noiseSpeed);

      // newCenter = center + spark_turbulence(center * freq, time) * amp
      const distort = dyno.dyno({
        inTypes: {
          center: "vec3",
          freq: "float",
          amp: "float",
          time: "float"
        },
        outTypes: { center: "vec3" },
        inputs: {
          center: split.center,
          freq: noiseFreq,
          amp: noiseAmp,
          time: animatedTime
        },
        globals: () => [turbulenceGlobals],
        statements: ({ inputs, outputs }) => [
          `${outputs.center} = ${inputs.center} + spark_turbulence(${inputs.center} * ${inputs.freq}, ${inputs.time}) * ${inputs.amp};`
        ]
      });

      const newScales = dyno.mul(split.scales, sizeScale);

      return {
        gsplat: dyno.combineGsplat({
          gsplat,
          center: distort.outputs.center,
          scales: newScales
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
    setNoiseSpeed: (v) => setUniform(noiseSpeed, v)
  };
}
