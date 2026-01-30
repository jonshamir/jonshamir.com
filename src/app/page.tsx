import { InlineLogoPlaceholder } from "../components/Logo/InlineLogoPlaceholder";
import { ProjectList } from "../components/ProjectList/ProjectList";
import { SelectedWork } from "../components/SelectedWork/SelectedWork";
import { EmailFormWrapper } from "../features/homepage/EmailFormWrapper/EmailFormWrapper";
import styles from "./page.module.css";

export default function Page() {
  return (
    <>
      <InlineLogoPlaceholder />

      <h2 className={`${styles.intro} ${styles.fadeIn}`}>
        Hi, I&rsquo;m{" "}
        <span className={styles.name}>
          <span className={styles.jon}> Jon</span>
          <span className={styles.yonatan}> Yonatan</span>
        </span>
      </h2>
      <p className={styles.fadeIn}>
        I build interactive experiences - from immersive 3D websites and spatial
        computing to thoughtful product interfaces.
      </p>
      <p className={styles.fadeIn}>
        I partner with product teams and startups, taking ideas from early
        prototypes to polished releases.
      </p>
      <p className={styles.fadeIn}>
        <a href="mailto:jon@studio-normal.com">Let&rsquo;s work together!</a>
      </p>

      <SelectedWork />

      <p></p>

      {/* <h3>Posts</h3>
      <PostList />
      <p /> */}
      <h3>Projects</h3>
      <ProjectList />
      <p />
      <EmailFormWrapper />
    </>
  );
}
