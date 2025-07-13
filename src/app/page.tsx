import { InlineLogoPlaceholder } from "../components/Logo/InlineLogoPlaceholder";
import { PostList } from "../components/PostList/PostList";
import { ProjectList } from "../components/ProjectList/ProjectList";
import { SocialLinks } from "../components/SocialLinks/SocialLinks";
import { EmailFormWrapper } from "../features/homepage/EmailFormWrapper/EmailFormWrapper";
import styles from "./page.module.css";

export default function Page() {
  return (
    <>
      <InlineLogoPlaceholder />
      <h1 className={styles.intro}>
        Hi, I&rsquo;m Jon <span>Yonatan</span>
      </h1>
      <p style={{ lineHeight: "1.6rem" }}>
        I work at the intersection of technology and design. I have experience
        building products, data visualizations, and interactive 3D graphics.
      </p>
      <p>
        <a href="mailto:jon@studio-normal.com">Let&rsquo;s work together!</a>
      </p>
      <figure className="full-bleed">
        <video
          src="homepage/earth.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{
            maxWidth: "1000px",
            maxHeight: "500px",
            backgroundColor: "var(--color-secondary)"
          }}
        />
      </figure>

      <h3>Posts</h3>
      <PostList />
      <p />
      <h3>Projects</h3>
      <ProjectList />
      <p />
      <SocialLinks />
      <EmailFormWrapper />
    </>
  );
}
