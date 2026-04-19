import { shaderMaterial } from "@react-three/drei";

import { erosionShaderChunk } from "./erosionShader";

export const TerrainMaterial = shaderMaterial(
  {
    uBaseAmplitude: 0.3,
    uBaseFrequency: 2.0,
    uBaseOctaves: 5,
    uDisplacementScale: 1.0
  },
  /* glsl */ `
    varying vec3 vNormalW;
    varying float vHeight;

    ${erosionShaderChunk}

    void main() {
      vec3 ht = erodedTerrain(uv);
      float h = ht.x;
      vec3 displaced = position + vec3(0.0, 0.0, h * uDisplacementScale);

      // Analytical normal from gradient of height in UV space.
      // Plane is 2x2 in XY, uv in [0,1], so d(position.xy)/d(uv) = (2, 2).
      float s = uDisplacementScale * 0.5;
      vec3 n = normalize(vec3(-ht.y * s, -ht.z * s, 1.0));

      vNormalW = normalize(mat3(modelMatrix) * n);
      vHeight = h;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `,
  /* glsl */ `
    varying vec3 vNormalW;
    varying float vHeight;

    void main() {
      vec3 lightDir = normalize(vec3(0.4, 0.6, 0.7));
      float lambert = clamp(dot(normalize(vNormalW), lightDir), 0.0, 1.0);
      float ambient = 0.25;
      vec3 base = mix(vec3(0.78, 0.78, 0.78), vec3(0.95, 0.95, 0.95), clamp(vHeight * 1.5 + 0.5, 0.0, 1.0));
      vec3 color = base * (ambient + (1.0 - ambient) * lambert);
      gl_FragColor = vec4(color, 1.0);
    }
  `
);
