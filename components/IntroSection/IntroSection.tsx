import { InlineLogoPlaceholder } from "../Logo/InlineLogoPlaceholder";
import { FluidSim } from "../FluidSim/FluidSim";

import styles from "./IntroSection.module.scss";

export function IntroSection() {
  return (
    <>
      <FluidSim />
      <div className={styles.IntroSection}>
        <InlineLogoPlaceholder />
        <h1>Hi, I&apos;m Jon Shamir</h1>
        <p>
          Designer & developer. My interests include interaction design, 3D
          graphics, data visualization and machine learning.
        </p>
        <p>
          Currently building spatial interfaces at&nbsp;
          <a href="https://www.sightful.com/">Sightful</a>.
        </p>
      </div>
    </>
  );
}
