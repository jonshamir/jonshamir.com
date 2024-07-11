varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;
varying vec2 vUvSplitVector;


void main() {
  float r = 0.5;
  float d = length(vUv - vec2(0.5, 0.5)) - r;
  float pixelSize = sqrt(pow(dFdx(d), 2.0) + pow(dFdy(d), 2.0));
  float thickness = max(0.005, pixelSize*2.0);
  d += thickness;
  d = abs(d) - thickness;
  float alpha = 1.0 - smoothstep(-pixelSize * 1.5, 0.0, d);



  // alpha = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));

  // Normalize uv to -1, 1
  vec2 uv0 = vUv * 2.0 - 1.0;

  if (dot(vNormal, vec3(0.0, 0.0, 1.0)) < 0.3) {
    // Mask half the circle
    alpha *= 1.0 - step(dot(uv0, vUvSplitVector), 0.0);
  }

  vec3 color = vNormal.xyz * 0.5 + 0.5;
  gl_FragColor = vec4(color, alpha);
    // gl_FragColor = vec4(1, 1, 1, alpha);

}
