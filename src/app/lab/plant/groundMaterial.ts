import { Color, ShaderMaterial, UniformsLib, UniformsUtils } from "three";

const vertexShader = /* glsl */ `
#include <common>
#include <shadowmap_pars_vertex>

varying vec3 vNormal;

void main() {
    #include <begin_vertex>
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>

    vNormal = normalize(normalMatrix * normal);

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

uniform vec3 baseColor;
uniform vec3 shadowColor;

void main() {
    vec3 color = baseColor;

    // Simple lighting
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
    color = mix(shadowColor, color, shadowMask);

    gl_FragColor = vec4(color, 1.0);
}
`;

export class GroundMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: UniformsUtils.merge([
        UniformsLib.lights,
        {
          baseColor: { value: new Color("#4b453d") },
          shadowColor: { value: new Color(0.4, 0.5, 0.7) }
        }
      ]),
      vertexShader,
      fragmentShader,
      lights: true
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
