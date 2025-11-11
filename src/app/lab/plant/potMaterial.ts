import {
  Color,
  DoubleSide,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils
} from "three";

const vertexShader = /* glsl */ `
#include <common>
#include <shadowmap_pars_vertex>

attribute float localZ;

varying vec3 vNormal;
varying float vLayer;

void main() {
    #include <begin_vertex>
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>

    vNormal = normalize(normalMatrix * normal);
    vLayer = localZ;

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

varying vec3 vNormal;
varying float vLayer;

uniform vec3 baseColor;
uniform vec3 shadowColor;

void main() {
    vec3 color = baseColor;

    // Simple lighting with directional light
    #if NUM_DIR_LIGHTS > 0
        vec3 lightDirection = directionalLights[0].direction;
        float NdotL = dot(vNormal, lightDirection);
        float diffuse = max(NdotL, 0.0);
        float ambient = 0.3;
        float lighting = ambient + diffuse * 0.7;
        color *= lighting;
    #endif

    // Calculate shadow and blend with shadow color
    float shadowMask = getShadowMask();
    // float aoShadow = smoothstep(0.0, 0.6, vLayer);
    float rimHeight = 0.745;
    float aoShadow = smoothstep(rimHeight, rimHeight - 0.3, vLayer) + step(rimHeight, vLayer);
    aoShadow *= smoothstep(0.0, 0.3, vLayer);
    
    vec3 shadowFinalColor = mix(shadowColor*0.85, shadowColor, aoShadow);

    color = mix(shadowFinalColor, color, shadowMask);

    
    gl_FragColor = vec4(color, 1.0);
}
`;

export class PotMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: UniformsUtils.merge([
        UniformsLib.lights,
        {
          baseColor: { value: new Color(0.8, 0.5, 0.3) },
          shadowColor: { value: new Color(0.3, 0.2, 0.1) }
        }
      ]),
      vertexShader,
      fragmentShader,
      lights: true,
      side: DoubleSide
    });
  }

  set baseColor(value: Color) {
    this.uniforms.baseColor.value = value;
  }
  get baseColor(): Color {
    return this.uniforms.baseColor.value as Color;
  }

  set shadowColor(value: Color) {
    this.uniforms.shadowColor.value = value;
  }
  get shadowColor(): Color {
    return this.uniforms.shadowColor.value as Color;
  }
}
