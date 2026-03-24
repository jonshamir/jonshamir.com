import { MAX_SHAPES } from "./constants";

export const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
precision highp float;

#define MAX_SHAPES ${MAX_SHAPES}

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uBlendFactor;
uniform float uWorldScale;
uniform int uShapeCount;
uniform vec4 uShapePos[MAX_SHAPES];
uniform vec4 uShapeParams[MAX_SHAPES];
uniform vec3 uShapeColors[MAX_SHAPES]; // pre-converted to OKLab on CPU
uniform float uNoiseAmount;

vec2 hash22(vec2 p) {
    vec3 a = fract(p.xyx * vec3(443.897, 441.423, 437.195));
    a += dot(a, a.yzx + 19.19);
    return fract((a.xx + a.yz) * a.zy) - 0.5;
}

vec3 oklabToLinear(vec3 lab) {
    float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
    float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
    float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
    l = l * l * l; m = m * m * m; s = s * s * s;
    return vec3(
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
}

vec3 linearToSrgb(vec3 c) {
    return pow(max(c, 0.0), vec3(1.0 / 2.2));
}

// SDF functions — keep in sync with sdf.ts
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
    vec3 labCol = vec3(0.0);
    float k = uBlendFactor;

    for (int i = 0; i < MAX_SHAPES; i++) {
        if (i >= uShapeCount) break;

        float angle = uShapePos[i].z;
        float ca = cos(-angle);
        float sa = sin(-angle);
        vec2 shapeP = mat2(ca, sa, -sa, ca) * (p - uShapePos[i].xy);
        float shapeDist = evalShape(shapeP, uShapeParams[i]);
        vec3 shapeLab = uShapeColors[i];

        float h = max(k - abs(shapeDist - d), 0.0) / k;
        float blend = clamp(0.5 + 0.5 * (shapeDist - d) / k, 0.0, 1.0);
        d = min(shapeDist, d) - k * 0.5 * (1.0 + h - sqrt(1.0 - h * (h - 2.0)));
        labCol = mix(shapeLab, labCol, blend);
    }
    col = oklabToLinear(labCol);

    return d ;
}

void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * uWorldScale;

    // Clean distance for sharp antialiased outline
    vec3 col;
    float d = sceneSDF(p, col);

    // Noisy color: re-sample at offset position
    vec2 noise = hash22(vUv * uResolution);
    vec3 noisyCol;
    sceneSDF(p + noise * uNoiseAmount, noisyCol);

    // Anti-aliased fill using screen-space derivatives
    float fw = fwidth(d);
    float fill = 1.0 - smoothstep(-fw * 0.5, fw * 0.5, d);

    vec3 finalCol = linearToSrgb(noisyCol);

    gl_FragColor = vec4(finalCol * fill, fill);
}
`;
