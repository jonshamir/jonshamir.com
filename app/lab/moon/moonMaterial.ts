import { shaderMaterial } from "@react-three/drei";
import { ReactThreeFiber } from "@react-three/fiber";
import * as THREE from "three";

interface MoonMaterialProps {
  albedoMap?: THREE.Texture;
  bumpMap?: THREE.Texture;
}

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

    // Receives pos in 3D cartesian coordinates (x, y, z)
    // Returns UV coordinates corresponding to pos using spherical texture mapping
    vec2 getSphericalUV(vec3 pos)
    {
        // 360 normalized to [-0.5,0.5]]
        float theta = atan(pos.z,-pos.x) / (2.0 * PI); 
        // 180 normalized to [0,1]
        float phi = 1.0 - acos(pos.y / length(pos)) / PI; 

        // Fix seam line
        float theta_frac = fract(theta); // Remap [-0.5,0.5] > [0,1]
        // uses a small bias to prefer the first 'UV set'
        theta = fwidth(theta) < fwidth(theta_frac) - 0.001 ? theta : theta_frac;

        return vec2(theta, phi);
    }

    // Converts tangent-space vector v to world-space, using the normal and tangent at a given point 
    vec3 tangentToWorldSpace(vec3 v, vec3 normal, vec3 tangent)
    {
      vec3 binormal = cross(tangent, normal);
      return v.x * tangent + v.z * normal + v.y * binormal;
    }

    // Returns the world-space bump-mapped normal for the given bumpMapData
    vec3 getBumpMappedNormal(        
      vec3 normal,      // Mesh surface normal at the point
      vec3 tangent,     // Mesh surface tangent at the point
      vec2 uv,          // UV coordinates of the point
      float bumpScale   // Bump scaling factor
    )
    {
      ivec2 size = textureSize(bumpMap, 0);
      vec2 du = vec2(1.0 / float(size.x), 0.0);
      vec2 dv = vec2(0.0, 1.0 / float(size.y));

      // Sample the height map
      float f = texture2D(bumpMap, uv).r;
      float fdu = texture2D(bumpMap, uv + du).r;
      float fdv = texture2D(bumpMap, uv + dv).r;

      // Calculate partial derivatives
      float ftu = bumpScale * (fdu - f) / du.x;
      float ftv = bumpScale * (fdv - f) / dv.y;

      // tangent-space normal
      vec3 n = vec3(ftu, -ftv, 1.0); // Cross-product of tangents

      return normalize(tangentToWorldSpace(n, normal, tangent));
    }

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

declare global {
  namespace JSX {
    interface IntrinsicElements {
      moonMaterial: ReactThreeFiber.Object3DNode<
        MoonMaterialProps,
        MoonMaterialProps
      >;
    }
  }
}