varying vec2 vUv;
varying vec3 vNormal;

uniform vec3 color;

void main() {
  float r = 0.5;
  float d = length(vUv - vec2(0.5, 0.5)) - r;
  float pixelSize = sqrt(pow(dFdx(d), 2.0) + pow(dFdy(d), 2.0));
  float thickness = max(0.005, pixelSize*2.0);
  d += thickness;
  d = abs(d) - thickness;
  float alpha = 1.0 - smoothstep(-pixelSize * 1.5, 0.0, d);


  vec3 normal = vNormal.xyz * 0.5 + 0.5;
  // gl_FragColor = vec4(normal, alpha);
  gl_FragColor = vec4(1, 1, 1, alpha);
}
