import Link from "next/link";

import styles from "./ProjectList.module.css";
import projectData from "./projects";

export function ProjectList() {
  return (
    <ul className={styles.ProjectList}>
      {projectData.map((project) => (
        <li key={project.slug}>
          <Link href={`/projects/${project.slug}`} className="clickable">
            <img
              src={`/homepage/project-icons/${project.slug}.svg`}
              alt={project.name}
            />
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
