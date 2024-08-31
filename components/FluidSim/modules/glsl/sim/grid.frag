precision highp float;
uniform sampler2D velocity;
uniform vec2 resolution;
uniform float darkTheme;
varying vec2 uv;

// Pi, the ratio of a circle's circumference to its diameter.
const float M_PI = 3.14159265358979323846264338327950288;
// M_PI / 3
const float M_PI_3 = 2.0943951024;

float sdCircle(in vec2 p, in float r) 
{
    return length(p) - r;
}

float circle(in vec2 p, in float strength)
{
    float baseRadius = 0.01 + pow(strength, 1.5) * 0.15;
    float minRadius = 0.06; // max(fwidth(length(p)), 0.04);
    float radius = max(baseRadius, minRadius);
    float d = sdCircle(p - vec2(0.5, 0.5), radius);
	// return (1.0 - smoothstep(-fwidth(d), fwidth(d), d)) * (baseRadius / radius);
    float s =
        darkTheme == 1.0 
        ? max(pow((baseRadius / radius), 4.0), 0.1)
        : (baseRadius / radius);

	return (1.0 - smoothstep(-0.01, 0.01, d)) * s;
}

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, s, -s, c);
	return m * v;
}

void main(){
    // fluid data
    vec2 vel = texture2D(velocity, uv).xy;
    float len = length(vel);

    // ====================================

    vec2 uv0 = uv;
    uv0.y = 1.0 - uv.y;

    // grid size
    vec2 n = resolution.xy * 0.025;
    vec2 uv1 = vec2(fract(uv0.x * n.x), fract(uv0.y * n.y));

    // grid dots
    vec2 offset = vel * 0.006 * n;
    float strength = length(offset) * 9.0;

    float padding = n.x > 20.0 ? 2.0 : 1.0;

    vec2 uvGridIndex = ceil(uv0 * n) / n;
    uvGridIndex *= step(uvGridIndex, vec2((n - padding)/n));
    uvGridIndex *= 1.0 - step(uvGridIndex, vec2((padding + 0.1)/n));
    float paddingMask = 1.0 - step(min(uvGridIndex.x, uvGridIndex.y), 0.0);
    
    float r = circle(
        uv1 + offset,
        strength
    );
    float g = circle(
        uv1 + rotate(offset, M_PI_3),
        strength
    );
    float b = circle(
        uv1 + rotate(offset, -M_PI_3),
        strength
    );
    vec3 color = sqrt(clamp(vec3(r,g,b), 0.0, 1.0));

    color.rg *= darkTheme == 1.0 ? 1.0 : 0.7;
    color = darkTheme == 1.0 ? color + 0.1 : 1.0 - color - 0.1;


    gl_FragColor = vec4(color, paddingMask * clamp(r+g+b, 0.0, 0.5));
}
