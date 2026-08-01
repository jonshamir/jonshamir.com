import Image from "next/image";
import Link from "next/link";
import { createElement } from "react";

import heroImg from "../../app/projects/simply/hero.jpg";
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
              <Image src={heroImg} alt="Illustration of Simply Piano XR" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
