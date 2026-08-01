import { clsx } from "clsx";

import { PostList } from "../components/PostList/PostList";
import { ProjectList } from "../components/ProjectList/ProjectList";
import { SelectedWork } from "../components/SelectedWork/SelectedWork";
import { StaggeredText } from "../components/StaggeredText/StaggeredText";
import { ContactButton } from "../features/homepage/ContactButton/ContactButton";
import { EmailFormWrapper } from "../features/homepage/EmailFormWrapper/EmailFormWrapper";
import styles from "./page.module.css";

export default function Page() {
  return (
    <div className={clsx("canvas", "flow")}>
      <section className={styles.heroSection}>
        <div className={clsx(styles.hero, "flow")}>
          <p className={clsx("fade-in", styles.introHeyWrapper)}>
            <span className={styles.introHey}>
              Hey! I&rsquo;m
              <span className={styles.name}>
                <span className={styles.jon}> Jon</span>
                <span className={styles.yonatan}> Yonatan</span>
              </span>
            </span>
          </p>
          <h2>
            <StaggeredText text="I build interactive experiences – from 3D web and spatial apps to thoughtful product interfaces." />
          </h2>
          <div style={{ flexGrow: 1 }} />
          <ContactButton />
        </div>

        <SelectedWork
          className={clsx("fade-in", styles.fadeInDelay, styles.heroMedia)}
        />
      </section>

      <section className={clsx(styles.section, "flow")}>
        <h3 className={styles.sectionTitle}>Selected Work</h3>
        <ProjectList />
      </section>

      <section className={clsx(styles.section, "flow")}>
        <h3 className={styles.sectionTitle}>Writing</h3>
        <PostList wide />
      </section>

      <section className={clsx(styles.section, "flow")}>
        <h3 className={styles.sectionTitle}>Mailing list</h3>
        <EmailFormWrapper />
      </section>
    </div>
  );
}
