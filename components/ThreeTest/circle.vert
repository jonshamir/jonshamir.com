varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;
varying vec2 vUvSplitVector;

void main() {
  vUv = uv;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = modelPosition.xyz;

  vViewDirection = normalize(cameraPosition - vWorldPosition);

  vNormal = normalize(vec3(viewMatrix * modelMatrix * vec4(normal, 0.0)));
  vWorldNormal = normalize(normalMatrix * normal);

  vec3 objectSpaceViewDirection = (inverse(modelMatrix) * vec4(vViewDirection, 0.0)).xyz;
  vUvSplitVector = objectSpaceViewDirection.xy;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
