import projectData from "./projectData.js";

import styles from "./ProjectSection.module.scss";

export function ProjectSection() {
  return (
    <div className={styles.ProjectSection}>
      <h2>Projects</h2>
      <div>
        {projectData.map((project) => (
          <a
            href={`site/projects/${project.slug}`}
            className={styles.ProjectTile}
            key={project.slug}
          >
            {/* <img
              src={`assets/projects/${project.slug}/cover.jpg`}
              alt={project.name}
              style={{ backgroundColor: project.color }}
            /> */}
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
