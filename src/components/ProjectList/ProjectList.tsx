import Link from "next/link";

import projectData from "./projects";
import styles from "./ProjectList.module.css";

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
            <strong>{project.name}</strong>
            <br />
            <span>{project.subtitle}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
