import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

export const ProjectionMappingMaterial = shaderMaterial(
  {
    albedoMap: null,
    specularMap: null,
    normalMap: null,
  },
  /* glsl */ ` // Vertex shader
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vVertex;
    varying vec3 vCameraPosition;
    varying vec3 vLightDirection;

    void main() {
        vUv = uv;
        vCameraPosition = cameraPosition;
        vNormal = normal; (modelViewMatrix * vec4(position, 1.0)).xyz;
        vVertex = vec3(modelMatrix * vec4(position, 1.0));
        vLightDirection = vec3(modelMatrix * vec4(1.0, 0.0, 0.0, 1.0));
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
    uniform sampler2D specularMap;

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

    // Implements an adjusted version of the Blinn-Phong lighting model
    vec3 blinnPhong(vec3 n, vec3 v, vec3 l, float shininess, vec3 albedo, float specularity, float ambientIntensity)
    {
        vec3 h = normalize(v + l);

        vec3 diffuse = max(0.0, dot(n, l)) * albedo;
        vec3 specular = vec3(pow(max(0.0, dot(n, h)), shininess) * specularity);
        vec3 ambient = albedo * ambientIntensity;

        return diffuse + specular + ambient;
    }


    void main() {
        vec2 uv = getSphericalUV(vVertex);
        vec4 albedo = LinearTosRGB(texture2D(albedoMap, uv));
        vec4 specular = texture2D(specularMap, uv);
        vec3 color = blinnPhong(
            normalize(vNormal),
            normalize(vCameraPosition - vVertex),
            normalize(vLightDirection),
            32.0,
            albedo.rgb,
            specular.r,
            0.1);

        gl_FragColor = vec4(color, 1.0);
    }
`
);
