export const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
precision highp float;

#define MAX_SHAPES 16

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uBlendFactor;
uniform float uWorldScale;
uniform int uShapeCount;
uniform vec4 uShapePos[MAX_SHAPES];
uniform vec4 uShapeParams[MAX_SHAPES];
uniform vec3 uShapeColors[MAX_SHAPES];

// SDF functions (Inigo Quilez)
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdRoundedBox(vec2 p, vec2 b, float r) {
    return sdBox(p, b - r) - r;
}

float evalShape(vec2 p, vec4 params) {
    int type = int(params.x);
    if (type == 0) {
        return sdCircle(p, params.y);
    } else if (type == 1) {
        return sdBox(p, vec2(params.y, params.z));
    } else {
        return sdRoundedBox(p, vec2(params.y, params.z), params.w);
    }
}

float sceneSDF(vec2 p, out vec3 col) {
    float d = 1e10;
    col = vec3(0.0);
    float k = uBlendFactor;

    for (int i = 0; i < MAX_SHAPES; i++) {
        if (i >= uShapeCount) break;

        vec2 shapeP = p - uShapePos[i].xy;
        float shapeDist = evalShape(shapeP, uShapeParams[i]);
        vec3 shapeCol = uShapeColors[i];

        // Smooth minimum with color interpolation
        float h = clamp(0.5 + 0.5 * (shapeDist - d) / k, 0.0, 1.0);
        d = mix(shapeDist, d, h) - k * h * (1.0 - h);
        col = mix(shapeCol, col, h);
    }
    return d;
}

float sceneSDFOnly(vec2 p) {
    vec3 dummy;
    return sceneSDF(p, dummy);
}

vec2 calcNormal(vec2 p) {
    float eps = uWorldScale / uResolution.y;
    float d = sceneSDFOnly(p);
    return normalize(vec2(
        sceneSDFOnly(p + vec2(eps, 0.0)) - d,
        sceneSDFOnly(p + vec2(0.0, eps)) - d
    ));
}

void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * uWorldScale;

    vec3 col;
    float d = sceneSDF(p, col);

    // Normal-based lighting
    vec2 n = calcNormal(p);

    // Anti-aliased fill using screen-space derivatives
    float fw = fwidth(d);
    float fill = 1.0 - smoothstep(-fw * 0.5, fw * 0.5, d);

    vec3 bg = vec3(0.06);
    vec3 finalCol = mix(bg, col, fill);

    gl_FragColor = vec4(finalCol, 1.0);
}
`;
