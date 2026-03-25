"use client";

import clsx from "clsx";

import { SideScroller } from "../../../components/SideScroller/SideScroller";
import styles from "./ProjectScroller.module.css";

const projects = [
  {
    title: "Spacetop",
    description: "Augmented reality laptop OS",
    image: "/projects/spacetop/hero.png"
  },
  {
    title: "Simply Piano XR",
    description: "Piano learning app for Android XR",
    image: "/projects/simply/cover.jpg"
  },
  {
    title: "Muser",
    description: "Smart music visualizer",
    image: "/projects/muser/hero.png"
  },
  {
    title: "Widgets Bar",
    description: "Customizable widgets bar",
    image: "/projects/widgets/screenshot.png",
    dark: true
  },
  {
    title: "Leaf Map",
    description: "Interactive botanical visualization",
    image: "/projects/leaf-map/hero.png",
    dark: true
  }
];

function ProjectItem({
  title,
  description,
  image,
  dark
}: {
  title: string;
  description: string;
  image: string;
  dark?: boolean;
}) {
  return (
    <div className={clsx(styles.item, dark && styles.dark)}>
      <div className={clsx(styles.itemContent)}>
        <h2>{title}</h2>
        <p>{description}</p>
        <span className="arrow">→</span>
      </div>
      <div className={styles.itemOverlay} />
      <img src={image} alt={title} className={styles.itemMedia} />
    </div>
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
