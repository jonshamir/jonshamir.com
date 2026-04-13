"use client";

import { clsx } from "clsx";
import type { StaticImageData } from "next/image";
import Link from "next/link";

import leafMapHero from "../../../app/projects/leaf-map/hero.png";
import muserHero from "../../../app/projects/muser/hero.png";
import prepbookHero from "../../../app/projects/prepbook/hero.jpg";
import simplyCover from "../../../app/projects/simply/cover.jpg";
import spacetopHero from "../../../app/projects/spacetop/hero.jpg";
import widgetsScreenshot from "../../../app/projects/widgets/screenshot.png";
import { SideScroller } from "../../../components/SideScroller/SideScroller";
import styles from "./ProjectScroller.module.css";

const projects = [
  {
    slug: "spacetop",
    title: "Spacetop",
    description: "Augmented reality laptop OS",
    image: spacetopHero
  },
  {
    slug: "simply",
    title: "Simply Piano XR",
    description: "Piano learning app for Android XR",
    image: simplyCover
  },
  {
    slug: "prepbook",
    title: "Prepbook",
    description: "Modern recipe manager",
    image: prepbookHero
  },
  {
    slug: "muser",
    title: "Muser",
    description: "Smart music visualizer",
    image: muserHero
  },
  {
    slug: "widgets",
    title: "Widgets Bar",
    description: "Customizable widgets bar",
    image: widgetsScreenshot,
    dark: true
  },
  {
    slug: "leaf-map",
    title: "Leaf Map",
    description: "Interactive botanical visualization",
    image: leafMapHero,
    dark: true
  }
];

function ProjectItem({
  slug,
  title,
  description,
  image,
  dark
}: {
  slug: string;
  title: string;
  description: string;
  image: StaticImageData;
  dark?: boolean;
}) {
  return (
    <Link
      href={`/projects/${slug}`}
      className={clsx(styles.item, dark && styles.dark)}
      draggable={false}
    >
      <div className={clsx(styles.itemContent)}>
        <h2>{title}</h2>
        <p>{description}</p>
        <span className="arrow">→</span>
      </div>
      <div className={styles.itemOverlay} />
      <img
        src={image.src}
        alt={title}
        className={styles.itemMedia}
        draggable={false}
      />
    </Link>
  );
}

export function ProjectScroller() {
  return (
    <SideScroller>
      {projects.map((project) => (
        <ProjectItem key={project.title} {...project} />
      ))}
    </SideScroller>
  );
}
