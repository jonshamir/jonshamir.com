"use client";

import clsx from "clsx";
import Link from "next/link";
import { QueryClient, QueryClientProvider } from "react-query";

import { InlineLogoPlaceholder } from "../components/Logo/InlineLogoPlaceholder";
import projectData from "../data/projects";
import { SOCIAL_LINKS } from "../data/social";
import { EmailForm } from "../features/homepage/EmailForm/EmailForm";
import { FluidSim } from "../features/homepage/FluidSim/FluidSim";
import styles from "./page.module.css";

const queryClient = new QueryClient();

export default function Page() {
  return (
    <>
      {/* <FluidSim /> */}
      <div className={styles.IntroSection}>
        <InlineLogoPlaceholder />
        <h1>Hi, I&rsquo;m Jon Shamir</h1>
        <p style={{ fontSize: "1.2rem", fontWeight: 350 }}>
          I&rsquo;m a product engineer and designer. My interests include
          interaction design, real-time 3D graphics, data visualization and
          machine learning.
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
      <h2>Projects</h2>
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
