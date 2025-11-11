import { Color, ShaderMaterial, UniformsLib, UniformsUtils } from "three";

const vertexShader = /* glsl */ `
#include <common>
#include <shadowmap_pars_vertex>

attribute float localX;
attribute float localY;
attribute float localZ;
attribute vec3 vertexBaseColor;
attribute vec3 vertexShadowColor;
attribute vec3 vertexSubsurfaceColor;

varying vec2 vUv;
varying vec3 vNormal;
varying float vLocalX;
varying float vLocalY;
varying float vLocalZ;
varying vec3 vViewPosition;
varying vec3 vBaseColor;
varying vec3 vShadowColor;
varying vec3 vSubsurfaceColor;

#if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 0
    varying vec4 vDirectionalShadowCoordFlipped[NUM_DIR_LIGHT_SHADOWS];
#endif

void main() {
    vUv = uv;
    vLocalX = localX;
    vLocalY = localY;
    vLocalZ = localZ;
    vBaseColor = vertexBaseColor;
    vShadowColor = vertexShadowColor;
    vSubsurfaceColor = vertexSubsurfaceColor;

    #include <begin_vertex>
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>

    vNormal = normalize(normalMatrix * normal);

    #include <project_vertex>
    #include <worldpos_vertex>
    #include <shadowmap_vertex>

    // Calculate view position for subsurface scattering
    vViewPosition = -mvPosition.xyz;

    // Calculate flipped shadow coordinates for translucency effect
    #if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 0
        // Reuse shadowWorldNormal that was already calculated by shadowmap_vertex
        vec3 flippedShadowWorldNormal = -shadowWorldNormal;
        vec4 flippedShadowWorldPosition;

        #pragma unroll_loop_start
        for (int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i++) {
            flippedShadowWorldPosition = worldPosition + vec4(flippedShadowWorldNormal * directionalLightShadows[i].shadowNormalBias, 0);
            vDirectionalShadowCoordFlipped[i] = directionalShadowMatrix[i] * flippedShadowWorldPosition;
        }
        #pragma unroll_loop_end
    #endif
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
varying vec3 vViewPosition;
varying vec3 vBaseColor;
varying vec3 vShadowColor;
varying vec3 vSubsurfaceColor;

uniform float age;
uniform vec3 tipColor;
uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float translucency;

#if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 0
    varying vec4 vDirectionalShadowCoordFlipped[NUM_DIR_LIGHT_SHADOWS];
#endif

void main() {
    // Base-to-tip gradient (using localZ: 0 at base, 1 at tip)
    // Use vertex base color instead of uniform
    vec3 colorAlongLength = mix(vBaseColor, tipColor, vLocalZ);

    // Top-to-bottom gradient (using localY: -1 at bottom, 1 at top)
    float topBottomMix = (vLocalY + 1.0) * 0.5; // Remap from [-1,1] to [0,1]
    vec3 topBottomColor = mix(bottomColor, topColor, topBottomMix);

    // Blend the two gradients
    vec3 color = mix(colorAlongLength, topBottomColor, 0.3);

    // Simple lighting using the directional light from the scene
    #if NUM_DIR_LIGHTS > 0
        // Use the first directional light from the scene
        vec3 lightDirection = directionalLights[0].direction;
        float NdotL = dot(vNormal, lightDirection);
        float diffuse = max(NdotL, 0.0);
        float ambient = 0.4;
        float lighting = ambient + diffuse * 0.6;
    #else
        // Fallback if no directional lights
        float lighting = 1.0;
    #endif

    // Calculate shadow
    float shadowMask = getShadowMask();

    // Translucency effect: determine if surface is facing away from light
    // Use smoothstep for gradual transition between front and back
    // NdotL range: -1 (facing away) to 1 (facing towards)
    float isFacingLight = smoothstep(-0.2, 0.2, NdotL); // Gradual transition around NdotL = 0

    float finalShadow = shadowMask;

    #if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 0
        // Sample shadow from opposite side for translucency
        DirectionalLightShadow directionalLight = directionalLightShadows[0];
        float backShadow = getShadow(
            directionalShadowMap[0],
            directionalLight.shadowMapSize,
            directionalLight.shadowIntensity,
            directionalLight.shadowBias,
            directionalLight.shadowRadius,
            vDirectionalShadowCoordFlipped[0]
        );

        // Invert back shadow: where shadow exists on opposite side, light passes through
        float transmittedShadow = backShadow * 0.8;

        // Account for leaf thickness
        //transmittedLight *= 1.0 - abs(vLocalX);

        // Apply translucency effect to backside (not facing light)
        finalShadow = mix(
            transmittedShadow, // Backside: add transmitted light
            shadowMask, // Front side: normal shadow
            isFacingLight
        );
    #endif

    color *= lighting * finalShadow;
    color += vShadowColor * (1.0 - finalShadow) - pow(1.0 - vLocalZ, 2.0) * 0.2;

    color += finalShadow *(1.0 - isFacingLight) * vSubsurfaceColor * 0.3;

    // Add specular highlights
    #if NUM_DIR_LIGHTS > 0
        vec3 viewDir = normalize(vViewPosition);
        vec3 lightDir = directionalLights[0].direction;

        // Calculate half vector for Blinn-Phong specular
        vec3 halfVector = normalize(lightDir + viewDir);
        float specular = pow(max(dot(vNormal, halfVector), 0.0), 32.0);

        // Only apply specular on front-facing surfaces
        specular *= isFacingLight;

        // Modulate by shadow
        specular *= finalShadow;

        // Add subtle specular highlight
        color += vec3(1.0, 1.0, 0.9) * specular * 0.4;
    #endif

    gl_FragColor = vec4(color, 1.0);
}
`;

export class PlantMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: UniformsUtils.merge([
        UniformsLib.lights,
        {
          age: { value: 1.0 },
          tipColor: { value: new Color(0.4, 0.7, 0.3) },
          topColor: { value: new Color(0.5, 0.6, 0.25) },
          bottomColor: { value: new Color(0.15, 0.2, 0.15) },
          translucency: { value: 0.6 }
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

  set translucency(value: number) {
    this.uniforms.translucency.value = value;
  }
  get translucency(): number {
    return this.uniforms.translucency.value as number;
  }
}
