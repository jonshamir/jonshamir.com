"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import projectData from "../../data/projects";

export default function ProjectLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const slug = path.split("/").pop();
  const projectIndex = projectData.findIndex((p) => p.slug === slug);
  if (projectIndex === -1) return;

  const nextProject = projectData[(projectIndex + 1) % projectData.length];
  return (
    <>
      {children}

      <Link
        href={`/projects/${nextProject.slug}`}
        className="clickable"
        style={{
          marginTop: "2rem",
          placeSelf: "flex-end",
          padding: "0.5rem 1rem",
          textDecoration: "none"
        }}
      >
        {nextProject.name} <span className="arrow">→</span>
        <br />
        <span style={{ opacity: "0.7" }}>{nextProject.subtitle}</span>
      </Link>
    </>
  );
}
