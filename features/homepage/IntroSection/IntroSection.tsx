import { InlineLogoPlaceholder } from "../../../components/Logo/InlineLogoPlaceholder";
import { FluidSim } from "../FluidSim/FluidSim";
import styles from "./IntroSection.module.scss";

export function IntroSection() {
  return (
    <>
      <FluidSim />
      <div className={styles.IntroSection}>
        <InlineLogoPlaceholder />
        <h1>Hi, I&rsquo;m Jon Shamir</h1>
        <p>
          I&rsquo;m a designer and software architect with over 10 years of
          professional experience. My interests include interaction design,
          real-time 3D graphics, data visualization and machine learning.
        </p>
      </div>
    </>
  );
}
