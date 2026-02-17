import { createElement } from "react";

import { ButtonLink } from "../Button";
import styles from "./ProjectList.module.css";
import projectData from "./projects";

export function ProjectList() {
  return (
    <ul className={styles.ProjectList}>
      {projectData.map((project) => (
        <li key={project.slug}>
          <ButtonLink
            href={`/projects/${project.slug}`}
            className={styles.projectLink}
          >
            {createElement(project.icon)}
            <span>
              <strong>{project.name}</strong>
              <br />
              <span>{project.subtitle}</span>
            </span>
          </ButtonLink>
        </li>
      ))}
    </ul>
  );
}
