import Image from "next/image";
import Link from "next/link";
import { createElement } from "react";

import styles from "./ProjectList.module.css";
import projectData from "./projects";

export default function ProjectList() {
  return (
    <ul className={styles.ProjectList}>
      {projectData.map((project) => (
        <li key={project.slug}>
          <Link
            href={`/projects/${project.slug}`}
            className={styles.projectLink}
          >
            {createElement(project.icon)}
            <strong className={styles.name}>{project.name}</strong>
            <span className={styles.subtitle}>{project.subtitle}</span>
            <div className={styles.preview}>
              <Image
                src={project.previewSmall}
                alt=""
                className={styles.previewSmall}
                loading="eager"
                fetchPriority="low"
              />
              <Image
                src={project.preview}
                alt=""
                className={styles.previewLarge}
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
