import type { GsplatModifier } from "@sparkjsdev/spark";
import { dyno } from "@sparkjsdev/spark";

const noiseGlobals = `
// Hash-based 3D value noise.
float spark_hash(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}

float spark_noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = spark_hash(i + vec3(0.0, 0.0, 0.0));
  float n100 = spark_hash(i + vec3(1.0, 0.0, 0.0));
  float n010 = spark_hash(i + vec3(0.0, 1.0, 0.0));
  float n110 = spark_hash(i + vec3(1.0, 1.0, 0.0));
  float n001 = spark_hash(i + vec3(0.0, 0.0, 1.0));
  float n101 = spark_hash(i + vec3(1.0, 0.0, 1.0));
  float n011 = spark_hash(i + vec3(0.0, 1.0, 1.0));
  float n111 = spark_hash(i + vec3(1.0, 1.0, 1.0));
  float nx00 = mix(n000, n100, f.x);
  float nx10 = mix(n010, n110, f.x);
  float nx01 = mix(n001, n101, f.x);
  float nx11 = mix(n011, n111, f.x);
  float nxy0 = mix(nx00, nx10, f.y);
  float nxy1 = mix(nx01, nx11, f.y);
  return mix(nxy0, nxy1, f.z) * 2.0 - 1.0;
}

vec3 spark_noise3vec(vec3 p) {
  return vec3(
    spark_noise3(p),
    spark_noise3(p + vec3(31.7, 0.0, 0.0)),
    spark_noise3(p + vec3(0.0, 47.3, 0.0))
  );
}
`;

export type NoiseDistortion = {
  modifier: GsplatModifier;
  setSizeScale: (v: number) => void;
  setNoiseAmp: (v: number) => void;
  setNoiseFreq: (v: number) => void;
};

// Spark GsplatModifier that perturbs splat centers with 3D value noise and
// scales splat size. Setters mutate the underlying uniforms directly so the
// GLSL pipeline only compiles once.
export function createNoiseDistortion(): NoiseDistortion {
  const sizeScale = dyno.dynoFloat(1.0, "uSizeScale");
  const noiseAmp = dyno.dynoFloat(0.0, "uNoiseAmp");
  const noiseFreq = dyno.dynoFloat(1.0, "uNoiseFreq");

  const modifier = dyno.dynoBlock(
    { gsplat: dyno.Gsplat },
    { gsplat: dyno.Gsplat },
    ({ gsplat }) => {
      if (!gsplat) throw new Error("noiseDistortion: missing gsplat input");

      const split = dyno.splitGsplat(gsplat).outputs;

      // newCenter = center + spark_noise3vec(center * freq) * amp
      const distort = dyno.dyno({
        inTypes: { center: "vec3", freq: "float", amp: "float" },
        outTypes: { center: "vec3" },
        inputs: {
          center: split.center,
          freq: noiseFreq,
          amp: noiseAmp
        },
        globals: () => [noiseGlobals],
        statements: ({ inputs, outputs }) => [
          `${outputs.center} = ${inputs.center} + spark_noise3vec(${inputs.center} * ${inputs.freq}) * ${inputs.amp};`
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
    setNoiseFreq: (v) => setUniform(noiseFreq, v)
  };
}
