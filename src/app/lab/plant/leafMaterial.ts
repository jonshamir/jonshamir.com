import { shaderMaterial } from "@react-three/drei";
import { Color } from "three";

export const LeafMaterial = shaderMaterial(
  {
    age: 1.0,
    baseColor: new Color(0.2, 0.6, 0.2),
    tipColor: new Color(0.4, 0.8, 0.3),
    topColor: new Color(0.3, 0.7, 0.25),
    bottomColor: new Color(0.15, 0.5, 0.15)
  },
  /* glsl */ ` // Vertex shader
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

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`,
  /* glsl */ ` // Fragment shader
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

        color *= lighting;

        gl_FragColor = vec4(color, 1.0);
    }
`
);
