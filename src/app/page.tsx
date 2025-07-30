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
      <InlineLogoPlaceholder />

      <p className={styles.intro}>
        <b>
          Hi, I&rsquo;m{" "}
          <span className={styles.name}>
            <span className={styles.jon}> Jon</span>
            <span className={styles.yonatan}> Yonatan</span>
          </span>
        </b>
      </p>
      <p>
        I work at the intersection of technology and design. I have experience
        building products, data visualizations, and interactive 3D graphics.
      </p>
      <p>
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
      <SocialLinks />
      <EmailFormWrapper />
    </>
  );
}
