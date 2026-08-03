"use client";

import Image from "next/image";
import Link from "next/link";
import { createElement, useState } from "react";

import styles from "./ProjectList.module.css";
import projectData from "./projects";

export default function ProjectList() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <ul className={styles.ProjectList}>
      {projectData.map((project) => (
        <li
          key={project.slug}
          onMouseEnter={() => setHovered(project.slug)}
          onMouseLeave={() => setHovered(null)}
        >
          <Link
            href={`/projects/${project.slug}`}
            className={styles.projectLink}
            style={hovered === project.slug ? { zIndex: 2 } : undefined}
          >
            {createElement(project.icon)}
            <strong className={styles.name}>{project.name}</strong>
            <span className={styles.subtitle}>{project.subtitle}</span>
            <div className={styles.preview}>
              <Image
                src={project.preview}
                alt=""
                loading="eager"
                fetchPriority="low"
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
