import clsx from "clsx";

import projectData from "./projectData";
import styles from "./ProjectSection.module.scss";

export function ProjectSection() {
  return (
    <div className={styles.ProjectSection}>
      <h2>Projects</h2>
      <div>
        {projectData.map((project) => (
          <a
            href={`projects/${project.slug}`}
            className={clsx("clickable", styles.ProjectTile)}
            key={project.slug}
          >
            <div className={styles.info}>
              <h3>{project.name}</h3>
              <span>{project.subtitle}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
