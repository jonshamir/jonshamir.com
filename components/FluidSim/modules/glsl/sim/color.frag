precision highp float;
uniform sampler2D velocity;
varying vec2 uv;

void main(){
    vec2 vel = texture2D(velocity, uv).xy;
    float len = length(vel);
    vel = vel * 0.5 + 0.5;
    
    vec3 color = vec3(vel, 1.);
    color = mix(vec3(0.0), color, len);

    // gl_FragColor = vec4(color, len);
}
