import { ButtonLink } from "../components/Button";
import { InlineLogoPlaceholder } from "../components/Logo/InlineLogoPlaceholder";
import { PostList } from "../components/PostList/PostList";
import { ProjectList } from "../components/ProjectList/ProjectList";
import { SelectedWork } from "../components/SelectedWork/SelectedWork";
import { EmailFormWrapper } from "../features/homepage/EmailFormWrapper/EmailFormWrapper";
import styles from "./page.module.css";

export default function Page() {
  return (
    <>
      {/* <InlineLogoPlaceholder /> */}

      <SelectedWork />

      <div className={styles.hero}>
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
        {/*<p className={styles.fadeIn}>
          I partner with product teams and startups, taking ideas from early
          prototypes to polished releases.
        </p>*/}
        <p className={styles.fadeIn}>
          <ButtonLink
            round
            variant="primary"
            href="mailto:jon@studio-normal.com"
          >
            Contact<span className="arrow">↗</span>
          </ButtonLink>
        </p>
        <br />
      </div>

      <p></p>

      <h3 className={styles.sectionTitle}>Writing</h3>
      <PostList />
      <p />
      <h3 className={styles.sectionTitle}>Projects</h3>
      <ProjectList />
      <p />
      <EmailFormWrapper />
    </>
  );
}
