import * as THREE from "three";

// Values controlled by Leva. Expands in Task 6 once real params are known.
export type TopoControls = {
  baseAmplitude: number;
  baseFrequency: number;
  baseOctaves: number;
  displacementScale: number;
};

export type TopoUniforms = {
  uBaseAmplitude: THREE.IUniform<number>;
  uBaseFrequency: THREE.IUniform<number>;
  uBaseOctaves: THREE.IUniform<number>;
  uDisplacementScale: THREE.IUniform<number>;
};

export function createTopoUniforms(): TopoUniforms {
  return {
    uBaseAmplitude: { value: 0.3 },
    uBaseFrequency: { value: 2.0 },
    uBaseOctaves: { value: 5 },
    uDisplacementScale: { value: 1.0 }
  };
}

export function syncLevaToUniforms(
  values: TopoControls,
  uniforms: TopoUniforms
) {
  uniforms.uBaseAmplitude.value = values.baseAmplitude;
  uniforms.uBaseFrequency.value = values.baseFrequency;
  uniforms.uBaseOctaves.value = values.baseOctaves;
  uniforms.uDisplacementScale.value = values.displacementScale;
}
