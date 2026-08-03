import { clsx } from "clsx";

import { ContactButton } from "../components/ContactButton/ContactButton";
import { PostList } from "../components/PostList/PostList";
import ProjectList from "../components/ProjectList/ProjectList";
import { SelectedWork } from "../components/SelectedWork/SelectedWork";
import { StaggeredText } from "../components/StaggeredText/StaggeredText";
import styles from "./page.module.css";

export default function Page() {
  return (
    <div className={clsx("canvas", "flow")}>
      <section className={styles.heroSection}>
        <div className={clsx(styles.hero)}>
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
            <StaggeredText
              text="I design and build interactive experiences – 3D websites, spatial apps and thoughtful product interfaces.
"
            />
          </h2>
          <div className={styles.heroSpacer} />
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

      {/* <section className={clsx(styles.section, "flow")}>
        <h3 className={styles.sectionTitle}>Projects & Experiments</h3>
        <PostList wide />
      </section> */}
    </div>
  );
}
