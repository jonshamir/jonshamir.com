import Link from "next/link";
import { createElement } from "react";

import styles from "./ProjectList.module.css";
import projectData from "./projects";

export function ProjectList() {
  return (
    <ul className={styles.ProjectList}>
      {projectData.map((project) => (
        <li key={project.slug}>
          <Link href={`/projects/${project.slug}`} className="clickable">
            {createElement(project.icon)}
            <span>
              <strong>{project.name}</strong>
              <br />
              <span>{project.subtitle}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
