import Common from "./Common";
import Output from "./Output";
import Mouse from "./Mouse";

export default class FluidSimManager {
  constructor(props) {
    this.props = props;

    Common.init();
    Mouse.init();

    this.init();
    this.loop();

    window.addEventListener("resize", this.resize.bind(this));
  }

  static getInstance(props) {
    if (!this.instance) {
      this.instance = new FluidSimManager(props);
    }
    this.instance.setWrapper(props.$wrapper);
    return this.instance;
  }

  setWrapper(wrapper) {
    wrapper.prepend(Common.renderer.domElement);
  }

  init() {
    this.setWrapper(this.props.$wrapper);
    this.output = new Output();
  }

  resize() {
    Common.resize();
    this.output.resize();
  }

  render() {
    Mouse.update();
    Common.update();
    this.output.update();
  }

  loop() {
    this.render();
    requestAnimationFrame(this.loop.bind(this));
  }

  setDarkTheme(darkTheme) {
    if (this.output.output.material === undefined) return;
    this.output.output.material.uniforms.darkTheme.value = darkTheme;
    this.output.output.material.needsUpdate = true;
  }
}
