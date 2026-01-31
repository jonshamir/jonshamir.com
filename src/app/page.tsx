import { InlineLogoPlaceholder } from "../components/Logo/InlineLogoPlaceholder";
import { PostList } from "../components/PostList/PostList";
import { ProjectList } from "../components/ProjectList/ProjectList";
import { SelectedWork } from "../components/SelectedWork/SelectedWork";
import { EmailFormWrapper } from "../features/homepage/EmailFormWrapper/EmailFormWrapper";
import styles from "./page.module.css";

export default function Page() {
  return (
    <>
      <div className={styles.hero}>
        <InlineLogoPlaceholder />

        <p className={styles.fadeIn}>
          <span className={styles.introHey}>
            Hey! I&rsquo;m
            <span className={styles.name}>
              <span className={styles.jon}> Jon</span>
              <span className={styles.yonatan}> Yonatan</span>
            </span>
          </span>
        </p>
        <h2 className={styles.fadeIn}>
          I build interactive experiences – from 3D websites and spatial
          computing to thoughtful product interfaces.
        </h2>
        <p className={styles.fadeIn}>
          I partner with product teams and startups, taking ideas from early
          prototypes to polished releases.
        </p>
        {/* <p className={styles.fadeIn}>
          <a href="mailto:jon@studio-normal.com">Contact</a>
        </p> */}
        <br />
      </div>

      <SelectedWork />

      <p></p>

      <h3>Writing</h3>
      <PostList />
      <p />
      <h3>Projects</h3>
      <ProjectList />
      <p />
      <EmailFormWrapper />
    </>
  );
}
