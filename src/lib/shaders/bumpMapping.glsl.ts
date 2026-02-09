import { tangentToWorldSpace } from "./lighting.glsl";

export const bumpMapping = /* glsl */ `
  ${tangentToWorldSpace}

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
`;
