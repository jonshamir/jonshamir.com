export const blinnPhong = /* glsl */ `
  // Implements an adjusted version of the Blinn-Phong lighting model
  vec3 blinnPhong(vec3 n, vec3 v, vec3 l, float shininess, vec3 albedo, float specularity, float ambientIntensity)
  {
      vec3 h = normalize(v + l);

      vec3 diffuse = max(0.0, dot(n, l)) * albedo;
      vec3 specular = vec3(pow(max(0.0, dot(n, h)), shininess) * specularity);
      vec3 ambient = albedo * ambientIntensity;

      return diffuse + specular + ambient;
  }
`;

export const tangentToWorldSpace = /* glsl */ `
  // Converts tangent-space vector v to world-space, using the normal and tangent at a given point
  vec3 tangentToWorldSpace(vec3 v, vec3 normal, vec3 tangent)
  {
    vec3 binormal = cross(tangent, normal);
    return v.x * tangent + v.z * normal + v.y * binormal;
  }
`;
