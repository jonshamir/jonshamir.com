varying vec2 vUv;

vec3 colorA = vec3(0.912,0.191,0.652);
vec3 colorB = vec3(1.000,0.777,0.052);

void main() {
  vec3 color = mix(colorA, colorB, vUv.x);

  float d = length(vUv - vec2(0.5, 0.5)) - 0.5;
  float c = 1.0 - smoothstep(-0.01, 0.0, d);

  gl_FragColor = vec4(c, c, c, c);
}
