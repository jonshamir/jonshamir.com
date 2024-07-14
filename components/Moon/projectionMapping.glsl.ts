export const projectionVertexShader = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
        vUv = uv;
        vNormal = normalize(vec3(viewMatrix * modelMatrix * vec4(normal, 0.0)));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const projectionFragmentShader = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;

    uniform sampler2D albedoMap;

    void main() {
        vec3 texture = texture2D(albedoMap, vUv).rgb;
        gl_FragColor = vec4(texture, 1.0);
    }
`;
