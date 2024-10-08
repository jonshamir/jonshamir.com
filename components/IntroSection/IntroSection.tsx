import { FluidSim } from "../FluidSim/FluidSim";
import { InlineLogoPlaceholder } from "../Logo/InlineLogoPlaceholder";
import styles from "./IntroSection.module.scss";

export function IntroSection() {
  return (
    <>
      <FluidSim />
      <div className={styles.IntroSection}>
        <InlineLogoPlaceholder />
        <h1>Hi, I&apos;m Jon Shamir</h1>
        <p>
          Software architect & graphic designer. My interests include
          interaction design, real-time 3D graphics, data viz and machine
          learning.
        </p>
        <p>
          Currently building spatial interfaces at&nbsp;
          <a href="https://www.sightful.com/">Sightful</a>.
        </p>
      </div>
    </>
  );
}
