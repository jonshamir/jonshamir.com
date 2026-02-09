export const sphericalUV = /* glsl */ `
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
`;
