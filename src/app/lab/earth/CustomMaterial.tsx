import { useMemo, useRef } from "react";
import * as THREE from "three";
import CustomShaderMaterial from "three-custom-shader-material";

import { bumpMapping } from "../../../lib/shaders/bumpMapping.glsl";
import { blinnPhong } from "../../../lib/shaders/lighting.glsl";
import { sphericalUV } from "../../../lib/shaders/sphericalUV.glsl";

const vertexShader = /* glsl */ ` // Vertex shader
varying vec3 vVertex;
varying vec3 vWorldVertex;
varying vec3 vCameraPosition;
varying vec3 vLightDirection;

void main() {
    //vUv = uv;
    // vCameraPosition = normalMatrix * cameraPosition;
    vCameraPosition = normalMatrix * cameraPosition;
    vVertex = position;
    vWorldVertex = vec3(modelMatrix * vec4(position, 1.0));
    vLightDirection = normalMatrix * vec3(2.5, 3.0, 2.0);
    // vLightDirection = vec3(nom * vec4(2.5, 3.0, 2.0, 1.0));
    // vLightDirection = vec3(2.5, 3.0, 2.0);
    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = /* glsl */ ` // Fragment shader
    // varying vec2 vUv;
    // varying vec3 vNormal;
    varying vec3 vVertex;
    varying vec3 vWorldVertex;
    varying vec3 vCameraPosition;
    varying vec3 vLightDirection;

    uniform sampler2D albedoMap;
    uniform sampler2D specularMap;
    uniform sampler2D bumpMap;
    uniform sampler2D cloudMap;

    ${sphericalUV}
    ${blinnPhong}
    ${bumpMapping}

    void main() {
        vec2 uv = getSphericalUV(vVertex);
        vec3 n = normalize(vNormal);
        vec3 tangent = normalize(cross(n, vec3(0.0, 1.0, 0.0)));

        n = getBumpMappedNormal(n, tangent, uv, 1.0 / 2000.0);

        vec3 viewDirection = normalize(vCameraPosition - vVertex);
        vec3 lightDirection = normalize(vLightDirection);

        float ambientIntensity = 0.15;
        vec3 atmosphereColor = vec3(0.53, 0.80, 1.00);

        // Sample textures
        vec4 albedo = LinearTosRGB(texture2D(albedoMap, uv));
        float specular = texture2D(specularMap, uv).r;

        vec3 color = blinnPhong(
            n,
            viewDirection,
            lightDirection,
            32.0,
            albedo.rgb,
            specular,
            ambientIntensity);

        // Atmosphere
        vec3 lambert = vec3(max(0.0, dot(n, lightDirection)));
        vec3 atmosphere = vec3(1.0 - max(0.0, dot(viewDirection, n))) * sqrt(lambert) * atmosphereColor;
        vec3 clouds = LinearTosRGB(texture2D(cloudMap, uv)).rgb * (sqrt(lambert) + ambientIntensity);

        color = color + atmosphere + clouds;
        vec3 gammaCorrectedColor = pow(color, vec3(2.2));

        csm_FragColor = vec4(gammaCorrectedColor, 1.0);
    }`;

export function CustomMaterial(props: {
  albedoMap: THREE.Texture;
  specularMap: THREE.Texture;
  bumpMap: THREE.Texture;
  cloudMap: THREE.Texture;
}) {
  const materialRef = useRef<THREE.Material>(null);

  const uniforms = useMemo(
    () => ({
      albedoMap: { value: props.albedoMap },
      specularMap: { value: props.specularMap },
      bumpMap: { value: props.bumpMap },
      cloudMap: { value: props.cloudMap }
    }),
    [props.albedoMap, props.specularMap, props.bumpMap, props.cloudMap]
  );

  return (
    <CustomShaderMaterial
      // @ts-expect-error ref is not typed
      ref={materialRef}
      baseMaterial={THREE.MeshLambertMaterial}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
    />
  );
}
