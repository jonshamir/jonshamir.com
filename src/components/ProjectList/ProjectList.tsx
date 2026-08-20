import Image from "next/image";
import Link from "next/link";
import { createElement } from "react";

import styles from "./ProjectList.module.css";
import projectData from "./projects";

export default function ProjectList() {
  return (
    // data-project-list is the hook for the global page-dim rules in main.css —
    // they can't reference this module's hashed classes
    <ul className={styles.ProjectList} data-project-list="">
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
