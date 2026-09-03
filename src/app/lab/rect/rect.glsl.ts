export const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vNormal = normalize(vec3(viewMatrix * modelMatrix * vec4(normal, 0.0)));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
precision mediump float;

varying vec2 vUv;
varying vec3 vNormal;

uniform vec3 uColor;
uniform vec4 uRadius;
uniform vec2 uSize;
uniform float uOpacity;
uniform float uStrokeWidth;
uniform vec2 uGridCells;
uniform vec3 uGridColor;
uniform float uGridWidth;

float sdRoundedBox(in vec2 p, in vec2 b, in vec4 r)
{
    r.xy = (p.x>0.0)?r.xy : r.zw;
    r.x  = (p.y>0.0)?r.x  : r.y;
    vec2 q = abs(p)-b+r.x;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
}
// Coverage of the nearest interior grid line along one axis; boundary lines
// are skipped. Derivatives are taken before any divergent return.
float gridLineCoverage(float coord, float halfExtent, float cells, float widthPx) {
    float px = length(vec2(dFdx(coord), dFdy(coord)));
    if (cells < 2.0) return 0.0;
    float cell = 2.0 * halfExtent / cells;
    float t = (coord + halfExtent) / cell;
    float k = floor(t + 0.5);
    if (k < 0.5 || k > cells - 0.5) return 0.0;
    float dist = abs(t - k) * cell;
    float halfW = 0.5 * widthPx * px;
    float aa = px * 0.75;
    return 1.0 - smoothstep(halfW - aa, halfW + aa, dist);
}
void main() {
    vec2 pos = (vUv - vec2(0.5, 0.5)) * 2.0 * uSize;
    float d = sdRoundedBox(pos, uSize, uRadius);
    float pixelSize = length(vec2(dFdx(d), dFdy(d)));
    float aa = pixelSize * 1.5;
    float outer = 1.0 - smoothstep(-aa, 0.0, d);
    float alpha = outer;
    if (uStrokeWidth > 0.0) {
        float inner = 1.0 - smoothstep(-aa, 0.0, d + uStrokeWidth * pixelSize);
        alpha = outer - inner;
    }

    alpha *= uOpacity;

    vec3 color = pow(uColor.rgb, vec3(1.0/2.2));

    if (uGridWidth > 0.0) {
        float interior = 1.0 - smoothstep(-aa, 0.0, d + uStrokeWidth * pixelSize);
        float g = max(
            gridLineCoverage(pos.x, uSize.x, uGridCells.x, uGridWidth),
            gridLineCoverage(pos.y, uSize.y, uGridCells.y, uGridWidth)
        ) * interior;
        vec3 gridColor = pow(uGridColor.rgb, vec3(1.0/2.2));
        float outAlpha = g + alpha * (1.0 - g);
        color = (gridColor * g + color * alpha * (1.0 - g)) / max(outAlpha, 1e-5);
        alpha = outAlpha;
    }

    if (alpha < 0.001) discard;

    vec3 normal = vNormal.xyz * 0.5 + 0.5;
    // gl_FragColor = vec4(normal, alpha);
    gl_FragColor = vec4(color, alpha);
}
`;
