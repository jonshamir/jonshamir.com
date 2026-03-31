"use client";

import clsx from "clsx";
import Link from "next/link";

import { SideScroller } from "../../../components/SideScroller/SideScroller";
import styles from "./ProjectScroller.module.css";

const projects = [
  {
    slug: "spacetop",
    title: "Spacetop",
    description: "Augmented reality laptop OS",
    image: "/projects/spacetop/hero.jpg"
  },
  {
    slug: "simply",
    title: "Simply Piano XR",
    description: "Piano learning app for Android XR",
    image: "/projects/simply/cover.jpg"
  },
  {
    slug: "prepbook",
    title: "Prepbook",
    description: "Modern recipe manager",
    image: "/projects/prepbook/hero.jpg"
  },
  {
    slug: "muser",
    title: "Muser",
    description: "Smart music visualizer",
    image: "/projects/muser/hero.png"
  },
  {
    slug: "widgets",
    title: "Widgets Bar",
    description: "Customizable widgets bar",
    image: "/projects/widgets/screenshot.png",
    dark: true
  },
  {
    slug: "leaf-map",
    title: "Leaf Map",
    description: "Interactive botanical visualization",
    image: "/projects/leaf-map/hero.png",
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
  image: string;
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
        src={image}
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
