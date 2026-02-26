import { ButtonLink } from "../components/Button";
import { InlineLogoPlaceholder } from "../components/Logo/InlineLogoPlaceholder";
import { PostList } from "../components/PostList/PostList";
import { ProjectList } from "../components/ProjectList/ProjectList";
import { SelectedWork } from "../components/SelectedWork/SelectedWork";
import { SocialLinks } from "../components/SocialLinks/SocialLinks";
import { EmailFormWrapper } from "../features/homepage/EmailFormWrapper/EmailFormWrapper";
import styles from "./page.module.css";

export default function Page() {
  return (
    <>
      <div className={styles.hero}>
        <br />
        <br />
        <br />

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
        <ButtonLink
          round
          variant="primary"
          href="mailto:jon@studio-normal.com"
          className={styles.contactButton}
        >
          Contact<span className="arrow">↗</span>
        </ButtonLink>
        <br />
      </div>
      <SelectedWork />

      <p />

      <div className={styles.columns}>
        <div>
          <h3 className={styles.sectionTitle}>Projects</h3>
          <ProjectList />
        </div>
        <div className={styles.smallColumn}>
          <h3 className={styles.sectionTitle}>Social</h3>
          <SocialLinks />
        </div>
      </div>

      <p />
      <p />

      <h3 className={styles.sectionTitle}>Writing</h3>
      <PostList />

      <p />
      <p />

      <h3 className={styles.sectionTitle}>Mailing list</h3>
      <EmailFormWrapper />
    </>
  );
}
