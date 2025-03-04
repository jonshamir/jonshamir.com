uniform vec2 mousePosition;
uniform vec2 mouseVelocity;
uniform float time;
uniform float aspect;
uniform sampler2D previousFrame;
uniform float decay;
uniform float size;
varying vec2 vUv;

float blendScreen(float base, float blend) {
	return 1.0-((1.0-base)*(1.0-blend));
}

vec3 blendScreen(vec3 base, vec3 blend) {
	return vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));
}

vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
	return (blendScreen(base, blend) * opacity + base * (1.0 - opacity));
}

void main() {
  vec2 uv = vUv;
  vec2 uvAspect = vUv;
  uvAspect.x *= aspect;
  
  vec2 mouse = mousePosition;
  mouse.x *= aspect;
  
  vec4 prev = texture2D(previousFrame, vUv);
  
  float dist = distance(uvAspect, mouse);
  float trail = smoothstep(size, 0.0, dist);
  
  vec3 velocity = vec3(abs(mouseVelocity), 0.0) * 0.5;
  vec3 color = blendScreen(prev.rgb * decay, vec3(velocity.r , velocity.g , 0.0), trail);

  gl_FragColor = vec4(color, 1.0);
}
