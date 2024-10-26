import clsx from "clsx";
import Link from "next/link";

import projectData from "./projectData";
import styles from "./ProjectSection.module.scss";

export function ProjectSection() {
  return (
    <div className={styles.ProjectSection}>
      <h2>Projects</h2>
      <div>
        {projectData.map((project) => (
          <Link
            href={`projects/${project.slug}`}
            passHref
            legacyBehavior
            key={project.slug}
          >
            <a className={clsx("clickable", styles.ProjectTile)}>
              <div className={styles.info}>
                <h3>{project.name}</h3>
                <span>{project.subtitle}</span>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
