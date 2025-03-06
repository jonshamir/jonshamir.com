"use client";

import clsx from "clsx";
import Link from "next/link";
import { QueryClient, QueryClientProvider } from "react-query";

import { InlineLogoPlaceholder } from "../components/Logo/InlineLogoPlaceholder";
import { FluidSim } from "../features/homepage/FluidSim/FluidSim";
import { SocialLinks } from "../features/homepage/SocialLinks/SocialLinks";
import styles from "./page.module.css";
import projectData from "./projects/projectData";

const queryClient = new QueryClient();

export default function Page() {
  return (
    <>
      <FluidSim />
      <div className={styles.IntroSection}>
        <InlineLogoPlaceholder />
        <h1>Hi, I&rsquo;m Jon Shamir</h1>
        <p style={{ fontSize: "1.4rem", fontWeight: 300 }}>
          I&rsquo;m a product engineer and designer. My interests include
          interaction design, real-time 3D graphics, data visualization and
          machine learning.
        </p>
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
              <h3>{project.name}</h3>
              <span>{project.subtitle}</span>
            </div>
          </a>
        </Link>
      ))}
      <QueryClientProvider client={queryClient}>
        <SocialLinks />
      </QueryClientProvider>
    </>
  );
}
