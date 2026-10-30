"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { PreviewStage } from "./PreviewStage";
import styles from "./ProjectList.module.css";
import projectData, { type ProjectItem } from "./projects";

type PreviewState = { open: boolean; current: number; prev: number | null };

function ProjectRow({
  project,
  slotRef,
  onEnter
}: {
  project: ProjectItem;
  slotRef: (el: HTMLDivElement | null) => void;
  onEnter: () => void;
}) {
  return (
    <li>
      <Link
        href={`/projects/${project.slug}`}
        className={styles.projectLink}
        onPointerEnter={onEnter}
      >
        <project.icon />
        <strong className={styles.name}>{project.name}</strong>
        <span className={styles.subtitle}>{project.subtitle}</span>
        <div className={styles.slot} ref={slotRef} />
      </Link>
    </li>
  );
}

export default function ProjectList() {
  const [preview, setPreview] = useState<PreviewState>({
    open: false,
    current: 0,
    prev: null
  });
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleEnter = (index: number) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;
    setPreview((p) =>
      !p.open
        ? { open: true, current: index, prev: null }
        : p.current === index
          ? p
          : { open: true, current: index, prev: p.current }
    );
  };

  const handleLeave = () =>
    setPreview((p) => (p.open ? { ...p, open: false, prev: null } : p));

  return (
    // data-project-list is the hook for the global page-dim rules in main.css —
    // they can't reference this module's hashed classes
    <div className={styles.ProjectList} data-project-list="">
      <ul className={styles.list} onPointerLeave={handleLeave}>
        {projectData.map((project, i) => (
          <ProjectRow
            key={project.slug}
            project={project}
            slotRef={(el) => {
              slotRefs.current[i] = el;
            }}
            onEnter={() => handleEnter(i)}
          />
        ))}
      </ul>
      <PreviewStage {...preview} slots={slotRefs} />
    </div>
  );
}
