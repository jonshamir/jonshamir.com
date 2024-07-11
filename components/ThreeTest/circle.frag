varying vec2 vUv;

vec3 colorA = vec3(0.912,0.191,0.652);
vec3 colorB = vec3(1.000,0.777,0.052);

void main() {
  vec3 color = mix(colorA, colorB, vUv.x);

  float r = 0.5;
  float d = length(vUv - vec2(0.5, 0.5)) - r;
  // float pixelSize = fwidth(d);
  float pixelSize = sqrt(pow(dFdx(d), 2.0) + pow(dFdy(d), 2.0));
  float thickness = max(0.01, pixelSize*2.0);
  d += thickness;
  d = abs(d) - thickness;
  float c = 1.0 - smoothstep(-pixelSize * 1.5, 0.0, d);

  gl_FragColor = vec4(1, 1, 1, c);
}
