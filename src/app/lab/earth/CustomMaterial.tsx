import { useMemo, useRef } from "react";
import * as THREE from "three";
import CustomShaderMaterial from "three-custom-shader-material";

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
