import { clsx } from "clsx";

import { InlineLogoPlaceholder } from "../components/Logo/InlineLogoPlaceholder";
import { PostList } from "../components/PostList/PostList";
import { ProjectList } from "../components/ProjectList/ProjectList";
import { SelectedWork } from "../components/SelectedWork/SelectedWork";
import { SocialLinks } from "../components/SocialLinks/SocialLinks";
import { StaggeredText } from "../components/StaggeredText/StaggeredText";
import { SideScroller } from "../components/SideScroller/SideScroller";
import { ContactButton } from "../features/homepage/ContactButton/ContactButton";
import { EmailFormWrapper } from "../features/homepage/EmailFormWrapper/EmailFormWrapper";
import { HeroBackground } from "../features/homepage/HeroBackground";
import styles from "./page.module.css";

export default function Page() {
  return (
    <>
      <div className={styles.heroSection}>
        <HeroBackground />
        <div className={styles.hero}>
          <InlineLogoPlaceholder />

          <p className={clsx(styles.fadeIn, styles.introHeyWrapper)}>
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
          <ContactButton />
          <br />
        </div>
      </div>
      {/* <SelectedWork className={clsx(styles.fadeIn, styles.fadeInDelay)} /> */}

      <SideScroller>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            style={{
              width: "20rem",
              background: "var(--color-accent)",
              padding: "2rem",
              minHeight: "300px",
              display: "grid",
              placeItems: "center",
              borderRadius: "var(--rounding-medium)"
            }}
          >
            <h2>Slide {i + 1}</h2>
          </div>
        ))}
      </SideScroller>

      <p />

      <div className={styles.columns}>
        <div>
          <h3 className={styles.sectionTitle}>Selected Projects</h3>
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
