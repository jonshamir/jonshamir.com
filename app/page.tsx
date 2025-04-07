"use client";

import clsx from "clsx";
import Link from "next/link";
import { QueryClient, QueryClientProvider } from "react-query";

import { InlineLogoPlaceholder } from "../components/Logo/InlineLogoPlaceholder";
import projectData from "../data/projects";
import { SOCIAL_LINKS } from "../data/social";
import { EmailForm } from "../features/homepage/EmailForm/EmailForm";
import styles from "./page.module.css";

const queryClient = new QueryClient();

export default function Page() {
  return (
    <>
      <div className={styles.IntroSection}>
        <InlineLogoPlaceholder />
        <h1>Hi, I&rsquo;m Jon</h1>
        <p style={{ fontSize: "1.2rem", fontWeight: 350 }}>
          I&rsquo;m a product engineer and designer.
          <br />I like to work at the intersection of technology and user
          experience, creating{" "}
          <a className="inlinePreview">
            interesting interactions
            <img src="homepage/overview.gif" alt="overview" />
          </a>{" "}
          and{" "}
          <a className="inlinePreview">
            data visualizations
            <video src="homepage/herbs.mp4" autoPlay muted loop playsInline />
          </a>{" "}
          utilizing{" "}
          <a className="inlinePreview">
            machine learning
            <video src="homepage/muser.mp4" autoPlay muted loop playsInline />
          </a>{" "}
          and{" "}
          <a className="inlinePreview">
            interactive 3D graphics
            <video src="homepage/earth.mp4" autoPlay muted loop playsInline />
          </a>{" "}
          {/* where I enjoy exploring the intersection of technology and user
          experience */}
        </p>
        <div className={styles.SocialLinks}>
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="clickable"
            >
              <link.icon />
              {/* <span>{link.label}</span> */}
            </a>
          ))}
        </div>
      </div>
      <h3>Projects</h3>
      <p>Some of the things I’ve made or worked on over the years:</p>
      {projectData.map((project) => (
        <Link
          href={`projects/${project.slug}`}
          passHref
          legacyBehavior
          key={project.slug}
        >
          <a className={clsx("clickable", styles.ProjectItem)}>
            <div className={styles.info}>
              <strong>{project.name}</strong>
              <span>{project.subtitle}</span>
            </div>
          </a>
        </Link>
      ))}

      <QueryClientProvider client={queryClient}>
        <EmailForm />
      </QueryClientProvider>
    </>
  );
}
