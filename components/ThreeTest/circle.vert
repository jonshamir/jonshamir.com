varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;

void main() {
  vUv = uv;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  vWorldPosition = modelPosition.xyz;

  vViewDirection = normalize(cameraPosition - vWorldPosition);

  vNormal = normalize(vec3(viewMatrix * modelMatrix * vec4(normal, 0.0)));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
