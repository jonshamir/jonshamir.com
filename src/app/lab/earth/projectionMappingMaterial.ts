import { shaderMaterial } from "@react-three/drei";
import { ReactThreeFiber } from "@react-three/fiber";
import * as THREE from "three";

import { bumpMapping } from "../../../lib/shaders/bumpMapping.glsl";
import { blinnPhong } from "../../../lib/shaders/lighting.glsl";
import { sphericalUV } from "../../../lib/shaders/sphericalUV.glsl";

interface ProjectionMappingMaterialProps {
  albedoMap?: THREE.Texture;
  specularMap?: THREE.Texture;
  bumpMap?: THREE.Texture;
  cloudMap?: THREE.Texture;
}

export const ProjectionMappingMaterial = shaderMaterial(
  {
    albedoMap: null,
    specularMap: null,
    bumpMap: null,
    cloudMap: null
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
        vLightDirection = vec3(2.5, 3.0, 2.0);
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
    uniform sampler2D bumpMap;
    uniform sampler2D cloudMap;

    #define PI 3.141592653

    ${sphericalUV}
    ${blinnPhong}
    ${bumpMapping}

    void main() {
        vec2 uv = getSphericalUV(vVertex);
        vec3 normal = normalize(vNormal);
        vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));

        normal = getBumpMappedNormal(normal, tangent, uv, 1.0 / 1000.0);

        vec3 viewDirection = normalize(vCameraPosition - vVertex);
        vec3 lightDirection = normalize(vLightDirection);

        float ambientIntensity = 0.15;
        vec3 atmosphereColor = vec3(0.53, 0.80, 1.00);

        // Sample textures
        vec4 albedo = LinearTosRGB(texture2D(albedoMap, uv));
        vec4 specular = texture2D(specularMap, uv);

        vec3 color = blinnPhong(
            normal,
            viewDirection,
            lightDirection,
            32.0,
            albedo.rgb,
            specular.r,
            ambientIntensity);

        // Atmosphere
        vec3 lambert = vec3(max(0.0, dot(normal, lightDirection)));
        vec3 atmosphere = vec3(1.0 - max(0.0, dot(viewDirection, normal))) * sqrt(lambert) * atmosphereColor;
        vec3 clouds = LinearTosRGB(texture2D(cloudMap, uv)).rgb * (sqrt(lambert) + ambientIntensity);

        color = color + atmosphere + clouds;

        gl_FragColor = vec4(color, 1.0);
    }
`
);

declare global {
  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace JSX {
    interface IntrinsicElements {
      projectionMappingMaterial: ReactThreeFiber.ThreeElement<
        typeof ProjectionMappingMaterial
      > &
        ProjectionMappingMaterialProps;
    }
  }
}
