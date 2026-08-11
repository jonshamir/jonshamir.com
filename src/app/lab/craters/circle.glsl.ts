export const circleVertexShader = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
    vUv = uv;
    vec4 localPosition = vec4(position, 1.0);
    vec4 localNormal = vec4(normal, 0.0);
    #ifdef USE_INSTANCING
    localPosition = instanceMatrix * localPosition;
    localNormal = instanceMatrix * localNormal;
    #endif
    vNormal = normalize(vec3(viewMatrix * modelMatrix * localNormal));
    gl_Position = projectionMatrix * modelViewMatrix * localPosition;
    }
`;

export const circleFragmentShader = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;

    uniform vec3 uColor;

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
    gl_FragColor = vec4(uColor.rgb, alpha);
    }
`;
