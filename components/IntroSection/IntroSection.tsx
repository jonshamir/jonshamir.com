import { MainLogo } from "../MainLogo/MainLogo";
import { FluidSim } from "../FluidSim/FluidSim";

import styles from "./IntroSection.module.scss";

export function IntroSection() {
  return (
    <>
      <FluidSim />
      <div className={styles.IntroSection}>
        <MainLogo />
        <h1>Hi, I&apos;m Jon Shamir</h1>
        <p>
          I&apos;m a designer & developer. My interests include interaction
          design, 3D graphics, data visualization and machine learning.
        </p>
        <p>
          Currently building spatial interfaces at&nbsp;
          <a href="https://www.sightful.com/">Sightful</a>.
        </p>
      </div>
    </>
  );
}
