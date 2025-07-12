import Link from "next/link";

import projectData from "../../data/projects";

export function ProjectList() {
  return (
    <ul>
      {projectData.map((project) => (
        <li key={project.slug}>
          <Link href={`projects/${project.slug}`}>
            <strong>{project.name}</strong> - <span>{project.subtitle}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
