import { shaderMaterial } from "@react-three/drei";

import { bumpMapping } from "../../../lib/shaders/bumpMapping.glsl";
import { sphericalUV } from "../../../lib/shaders/sphericalUV.glsl";

export const MoonMaterial = shaderMaterial(
  {
    albedoMap: null,
    bumpMap: null
  },
  /* glsl */ ` // Vertex shader
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vVertex;
    varying vec3 vWorldVertex;
    varying vec3 vCameraPosition;
    varying vec3 vLightDirection;

    void main() {
        vUv = uv;
        vCameraPosition = cameraPosition;
        vNormal = vec3(modelMatrix * vec4(normal, 0.0));
        vVertex = position;
        vWorldVertex = vec3(modelMatrix * vec4(position, 1.0));
        vLightDirection = vec3(2.5, 0.0, 2.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`,
  /* glsl */ ` // Fragment shader
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vVertex;
    varying vec3 vCameraPosition;
    varying vec3 vLightDirection;

    uniform sampler2D albedoMap;
    uniform sampler2D bumpMap;

    #define PI 3.141592653

    ${sphericalUV}
    ${bumpMapping}

    // Implementation taken from https://mimosa-pudica.net/improved-oren-nayar.html
    float improvedOrenNayar(vec3 v, vec3 l, vec3 n)
    {
      float rho = 0.25;
      float sigma = PI / 8.0;
      float sigmaSqared = sigma * sigma;

      float A = 1.0 / (PI + (0.5*PI - (2.0/3.0))*sigma);
      float B = sigma * A;

      float LdotV = clamp(dot(l, v), 0.0, 1.0);
      float NdotL = clamp(dot(n, l), 0.0, 1.0);
      float NdotV = clamp(dot(n, v), 0.0, 1.0);

      float s = LdotV - NdotL * NdotV;
      float t = 1.0;
      if (s > 0.0) t = max(NdotL, NdotV);

      return rho * NdotL * (A + B * (s / t));
    }

    void main() {
        vec2 uv = getSphericalUV(vVertex);
        vec3 normal = normalize(vNormal);
        vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
        normal = getBumpMappedNormal(normal, tangent, uv, 1.0 / 400.0);

        vec3 viewDirection = normalize(vCameraPosition - vVertex);
        vec3 lightDirection = normalize(vLightDirection);

        vec4 albedo = LinearTosRGB(texture2D(albedoMap, uv));

        float orenNayar =  improvedOrenNayar(viewDirection, lightDirection, normal);

        vec3 color = clamp((albedo.rgb) * (orenNayar * 15.0) + 0.004, 0.0, 1.0);
        // color = pow(color, vec3(1.0 / 2.2)) + 0.001;

        gl_FragColor = vec4(color, 1.0);
    }
`
);
