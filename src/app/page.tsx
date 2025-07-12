import React from "react";

import { InlineLogoPlaceholder } from "../components/Logo/InlineLogoPlaceholder";
import { PostList } from "../components/PostList/PostList";
import { ProjectList } from "../components/ProjectList/ProjectList";
import { SOCIAL_LINKS } from "../data/social";
import { EmailFormWrapper } from "../features/homepage/EmailFormWrapper/EmailFormWrapper";
import styles from "./page.module.css";

export default function Page() {
  return (
    <>
      <div className={styles.IntroSection}>
        <InlineLogoPlaceholder />
        <h1>
          Hi, I&rsquo;m Jon <span>Yonatan</span>
        </h1>
        <p style={{ lineHeight: "1.6rem" }}>
          I work at the intersection of technology and design. I have experience
          building products, data visualizations, and interactive 3D graphics.
        </p>
        <p>Let&rsquo;s work together!</p>
        <video src="homepage/earth.mp4" autoPlay muted loop playsInline />
      </div>
      <h3>Posts</h3>
      <PostList />
      <h3>Projects</h3>
      <ProjectList />
      <br />
      <br />

      <div className={styles.SocialLinks}>
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="clickable"
          >
            {React.createElement(link.icon)}
            {/* <span>{link.label}</span> */}
          </a>
        ))}
      </div>
      <EmailFormWrapper />
    </>
  );
}
