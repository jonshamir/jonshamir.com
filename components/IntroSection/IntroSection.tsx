import { MainLogo } from "../MainLogo/MainLogo";
import { FluidSim } from "../FluidSim/FluidSim";

import styles from "./IntroSection.module.scss";

export function IntroSection() {
  return (
    <>
      <FluidSim />
      <div className={styles.IntroSection}>
        <MainLogo />
        <h1>Hi, I'm Jon Shamir</h1>
        <p>
          I'm a designer & developer. My interests include computer graphics,
          data visualization, web technologies and machine learning.
        </p>
        <p>
          Currently building spatial UI at{" "}
          <a href="https://www.sightful.com/">Sightful</a>.
        </p>
      </div>
    </>
  );
}
