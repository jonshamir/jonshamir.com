import * as THREE from "three";

import externalForce_frag from "./glsl/sim/externalForce.frag";
import mouse_vert from "./glsl/sim/mouse.vert";
import Mouse from "./Mouse";
import ShaderPass from "./ShaderPass";

export default class ExternalForce extends ShaderPass {
  constructor(simProps) {
    super({
      output: simProps.dst,
    });

    this.init(simProps);
  }

  init(simProps) {
    super.init();
    const mouseG = new THREE.PlaneGeometry(1, 1);

    const mouseM = new THREE.RawShaderMaterial({
      vertexShader: mouse_vert,
      fragmentShader: externalForce_frag,
      blending: THREE.AdditiveBlending,
      uniforms: {
        px: {
          value: simProps.cellScale,
        },
        force: {
          value: new THREE.Vector2(0.0, 0.0),
        },
        center: {
          value: new THREE.Vector2(0.0, 0.0),
        },
        scale: {
          value: new THREE.Vector2(simProps.cursor_size, simProps.cursor_size),
        },
      },
    });

    this.mouse = new THREE.Mesh(mouseG, mouseM);
    this.scene.add(this.mouse);
  }

  update(props) {
    const forceX = (Mouse.diff.x / 2) * props.mouse_force;
    const forceY = (Mouse.diff.y / 2) * props.mouse_force;

    const centerX = Mouse.coords.x;
    const centerY = Mouse.coords.y;

    const uniforms = this.mouse.material.uniforms;

    uniforms.force.value.set(forceX, forceY);
    uniforms.center.value.set(centerX, centerY);
    uniforms.scale.value.set(props.cursor_size, props.cursor_size);

    super.update();
  }
}
