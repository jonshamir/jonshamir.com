import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

export const ProjectionMappingMaterial = shaderMaterial(
  {
    albedoMap: null,
    projectionMap: null,
  },
  /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vVertex;

    void main() {
        vUv = uv;
        vNormal = normalize(vec3(viewMatrix * modelMatrix * vec4(normal, 0.0)));
        vVertex = vec3(modelMatrix * vec4(position, 1.0));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`,
  /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vVertex;

    uniform sampler2D albedoMap;

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

    float CalcMipLevel(vec2 texture_coord)
    {
        vec2 dx = dFdx(texture_coord);
        vec2 dy = dFdy(texture_coord);
        float delta_max_sqr = max(dot(dx, dx), dot(dy, dy));
        
        return max(0.0, 0.5 * log2(delta_max_sqr));
    }

    // Receives pos in 3D cartesian coordinates (x, y, z)
    // Returns UV coordinates corresponding to pos using spherical texture mapping
    vec3 sampleSphericalTexture(sampler2D tex, vec3 pos)
    {
        // atan returns a value between -pi and pi
        // so we divide by pi * 2 to get -0.5 to 0.5
        float phi = -atan(pos.z, pos.x) / (PI * 2.0);
        // 0.0 to 1.0 range
        float phi_frac = fract(phi);
        // acos returns 0.0 at the top, pi at the bottom
        // so we flip the y to align with Unity's OpenGL style
        // texture UVs so 0.0 is at the bottom
        float theta = 1.0 - acos(pos.y / length(pos)) / PI; 
        // construct the primary uv
        vec2 uvA = vec2(phi, theta);
        // construct the secondary uv using phi_frac
        vec2 uvB = vec2(phi_frac, theta);
        // get the min mip level of either uv sets
        // _TextureName_TexelSize.zw is the texture resolution
        vec2 texSize = vec2(textureSize(tex, 0));
        float mipLevel = min(
            CalcMipLevel(uvA * texSize),
            CalcMipLevel(uvB * texSize)
        );
        // sample texture with explicit mip level
        // the z component is 0.0 because it does nothing
        vec4 col = texture2D(tex, uvA, mipLevel);

        return col.rgb;
    }



    void main() {
        vec2 uv = getSphericalUV(vVertex);
        vec3 texture = texture2D(albedoMap, uv).rgb;
        // vec3 texture = sampleSphericalTexture(albedoMap, vVertex);
        vec3 color = texture * 2.0;
        gl_FragColor = vec4(color, 1.0);
    }
`
);
