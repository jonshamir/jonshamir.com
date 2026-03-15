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
uniform vec3 uBgColor;

// Linear sRGB <-> OKLab (Björn Ottosson)
vec3 linearToOklab(vec3 c) {
    float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
    float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
    float s = 0.0883024619 * c.r + 0.2220049168 * c.g + 0.6896926213 * c.b;
    l = pow(l, 1.0 / 3.0); m = pow(m, 1.0 / 3.0); s = pow(s, 1.0 / 3.0);
    return vec3(
        0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    );
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

vec3 srgbToLinear(vec3 c) {
    return pow(c, vec3(2.2));
}

vec3 linearToSrgb(vec3 c) {
    return pow(max(c, 0.0), vec3(1.0 / 2.2));
}

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
    vec3 labCol = vec3(0.0);
    float k = uBlendFactor;

    for (int i = 0; i < MAX_SHAPES; i++) {
        if (i >= uShapeCount) break;

        float angle = uShapePos[i].z;
        float ca = cos(-angle);
        float sa = sin(-angle);
        vec2 shapeP = mat2(ca, sa, -sa, ca) * (p - uShapePos[i].xy);
        float shapeDist = evalShape(shapeP, uShapeParams[i]);
        vec3 shapeLab = linearToOklab(srgbToLinear(uShapeColors[i]));

        // Smooth minimum with color interpolation in OKLab
        float h = clamp(0.5 + 0.5 * (shapeDist - d) / k, 0.0, 1.0);
        d = mix(shapeDist, d, h) - k * h * (1.0 - h);
        labCol = mix(shapeLab, labCol, h);
    }
    col = oklabToLinear(labCol);
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

    vec3 bg = uBgColor;
    vec3 finalCol = linearToSrgb(mix(bg, col, fill));

    gl_FragColor = vec4(finalCol, 1.0);
}
`;
