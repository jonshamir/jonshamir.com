import { Color, ShaderMaterial, UniformsLib, UniformsUtils } from "three";

const vertexShader = /* glsl */ `
#include <common>
#include <shadowmap_pars_vertex>

attribute float localX;
attribute float localY;
attribute float localZ;

varying vec2 vUv;
varying vec3 vNormal;
varying float vLocalX;
varying float vLocalY;
varying float vLocalZ;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vLocalX = localX;
    vLocalY = localY;
    vLocalZ = localZ;

    #include <begin_vertex>
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>
    #include <project_vertex>
    #include <worldpos_vertex>
    #include <shadowmap_vertex>
}
`;

const fragmentShader = /* glsl */ `
#include <common>
#include <packing>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

varying vec2 vUv;
varying vec3 vNormal;
varying float vLocalX;
varying float vLocalY;
varying float vLocalZ;

uniform float age;
uniform vec3 baseColor;
uniform vec3 tipColor;
uniform vec3 topColor;
uniform vec3 bottomColor;

void main() {
    // Base-to-tip gradient (using localZ: 0 at base, 1 at tip)
    vec3 colorAlongLength = mix(baseColor, tipColor, vLocalZ);

    // Top-to-bottom gradient (using localY: -1 at bottom, 1 at top)
    float topBottomMix = (vLocalY + 1.0) * 0.5; // Remap from [-1,1] to [0,1]
    vec3 topBottomColor = mix(bottomColor, topColor, topBottomMix);

    // Blend the two gradients
    vec3 color = mix(colorAlongLength, topBottomColor, 0.3);

    // Simple lighting using normal
    vec3 lightDirection = normalize(vec3(0.5, 1.0, 0.5));
    float diffuse = max(dot(vNormal, lightDirection), 0.0);
    float ambient = 0.4;
    float lighting = ambient + diffuse * 0.6;

    // Calculate shadow
    float shadowMask = getShadowMask();

    vec3 shadowColor = vec3(0.06, 0.1, 0.15);

    color *= lighting * shadowMask;
    color += shadowColor * (1.0 - shadowMask);

    gl_FragColor = vec4(color, 1.0);
}
`;

export class LeafMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: UniformsUtils.merge([
        UniformsLib.lights,
        {
          age: { value: 1.0 },
          baseColor: { value: new Color(0.2, 0.4, 0.24) },
          tipColor: { value: new Color(0.4, 0.7, 0.3) },
          topColor: { value: new Color(0.5, 0.6, 0.25) },
          bottomColor: { value: new Color(0.15, 0.2, 0.15) }
        }
      ]),
      vertexShader,
      fragmentShader,
      lights: true
    });
  }

  // Expose uniform setters for easier use
  set age(value: number) {
    this.uniforms.age.value = value;
  }
  get age(): number {
    return this.uniforms.age.value as number;
  }

  set baseColor(value: Color) {
    this.uniforms.baseColor.value = value;
  }
  get baseColor(): Color {
    return this.uniforms.baseColor.value as Color;
  }

  set tipColor(value: Color) {
    this.uniforms.tipColor.value = value;
  }
  get tipColor(): Color {
    return this.uniforms.tipColor.value as Color;
  }

  set topColor(value: Color) {
    this.uniforms.topColor.value = value;
  }
  get topColor(): Color {
    return this.uniforms.topColor.value as Color;
  }

  set bottomColor(value: Color) {
    this.uniforms.bottomColor.value = value;
  }
  get bottomColor(): Color {
    return this.uniforms.bottomColor.value as Color;
  }
}
