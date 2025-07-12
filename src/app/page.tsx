"use client";

import clsx from "clsx";
import Link from "next/link";
import React from "react";
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
        <h1>
          Hi, I&rsquo;m Jon <span>Yonatan</span>
        </h1>
        <p style={{ lineHeight: "1.6rem" }}>
          I work at the intersection of technology and design. I have experience
          building products, data visualizations, and interactive 3D graphics.
        </p>
        <p>Let&rsquo;s work together!</p>
        <video src="homepage/earth.mp4" autoPlay muted loop playsInline />
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
      </div>
      <h3>Posts</h3>
      <h3>Projects</h3>
      {projectData.map((project) => (
        <Link
          href={`projects/${project.slug}`}
          key={project.slug}
          className={clsx("clickable", styles.ProjectItem)}
        >
          <div className={styles.info}>
            <strong>{project.name}</strong>
            <span>{project.subtitle}</span>
          </div>
        </Link>
      ))}

      <QueryClientProvider client={queryClient}>
        <EmailForm />
      </QueryClientProvider>
    </>
  );
}
