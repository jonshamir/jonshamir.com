// src/app/lab/campfire/rendering/surfaceMaterial.ts
import { ShaderMaterial, type DataTexture } from "three";

const VERT = /* glsl */ `
  varying vec3 vLocalPos;
  void main() {
    vLocalPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vLocalPos;

  uniform sampler2D uTemperature;
  uniform sampler2D uChar;
  uniform sampler2D uFuel;

  uniform float uVMin;
  uniform float uVMax;
  uniform float uSegLength;
  uniform vec3 uWoodColor;
  uniform float uShowHeatmap;

  // Maps a Kelvin temperature to (rgb, intensity) for the emissive term.
  vec3 emissiveFromT(float T) {
    float t = clamp((T - 600.0) / 900.0, 0.0, 1.0);
    vec3 hot  = vec3(1.0, 0.55, 0.15);
    vec3 cool = vec3(0.0, 0.0, 0.0);
    return mix(cool, hot, t) * t;
  }

  vec3 heatmap(float T) {
    float t = clamp((T - 293.0) / (1500.0 - 293.0), 0.0, 1.0);
    return vec3(t, t * 0.4, 1.0 - t);
  }

  void main() {
    float angle = atan(vLocalPos.z, vLocalPos.x); // -PI..PI
    float u = angle / (2.0 * 3.14159265) + 0.5;   // 0..1
    float vLocal = vLocalPos.y / uSegLength + 0.5; // 0..1 within this segment
    float v = mix(uVMin, uVMax, vLocal);

    float T = texture2D(uTemperature, vec2(u, v)).r;
    float charAmt = texture2D(uChar, vec2(u, v)).r;

    vec3 albedo = mix(uWoodColor, vec3(0.05, 0.04, 0.04), charAmt);
    vec3 emissive = emissiveFromT(T);

    vec3 color = albedo + emissive;
    if (uShowHeatmap > 0.5) {
      color = heatmap(T);
    }
    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface SurfaceMaterialUniforms {
  textures: { temperature: DataTexture; char: DataTexture; fuel: DataTexture };
  uVMin: number;
  uVMax: number;
  segLength: number;
  woodColor: [number, number, number];
  showHeatmap: boolean;
}

export function createSurfaceMaterial(u: SurfaceMaterialUniforms): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTemperature: { value: u.textures.temperature },
      uChar: { value: u.textures.char },
      uFuel: { value: u.textures.fuel },
      uVMin: { value: u.uVMin },
      uVMax: { value: u.uVMax },
      uSegLength: { value: u.segLength },
      uWoodColor: { value: u.woodColor },
      uShowHeatmap: { value: u.showHeatmap ? 1 : 0 }
    }
  });
}
