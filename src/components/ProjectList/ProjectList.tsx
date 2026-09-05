"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import styles from "./ProjectList.module.css";
import projectData, { type ProjectItem } from "./projects";

function ProjectRow({ project }: { project: ProjectItem }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Measures how far each preview image's bottom would poke past the viewport
  // and hands it to the hover rule, which clamps it and adds the gap. The rect
  // includes the in-flight transform, so subtract its translateY.
  const updateOverflows = () => {
    if (!previewRef.current) return;
    const imgs = Array.from(previewRef.current.querySelectorAll("img"));
    const overflows = imgs.map((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.height === 0) return null;
      const t = getComputedStyle(el).transform;
      const currentY = t === "none" ? 0 : new DOMMatrixReadOnly(t).m42;
      return rect.bottom - currentY - window.innerHeight;
    });
    imgs.forEach((el, i) => {
      if (overflows[i] !== null)
        el.style.setProperty("--preview-overflow", `${overflows[i]}px`);
    });
  };

  const handleEnter = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;
    updateOverflows();
    window.addEventListener("scroll", updateOverflows, {
      passive: true,
      signal
    });
    window.addEventListener("resize", updateOverflows, { signal });
  };

  const handleLeave = () => abortRef.current?.abort();

  useEffect(() => () => abortRef.current?.abort(), []);

  return (
    <li>
      <Link
        href={`/projects/${project.slug}`}
        className={styles.projectLink}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
      >
        <project.icon />
        <strong className={styles.name}>{project.name}</strong>
        <span className={styles.subtitle}>{project.subtitle}</span>
        <div className={styles.preview} ref={previewRef}>
          <Image
            src={project.previewSmall}
            alt=""
            className={styles.previewSmall}
            loading="eager"
            fetchPriority="low"
          />
          <Image
            src={project.preview}
            alt=""
            className={styles.previewLarge}
            loading="eager"
            fetchPriority="low"
          />
        </div>
      </Link>
    </li>
  );
}

export default function ProjectList() {
  return (
    // data-project-list is the hook for the global page-dim rules in main.css —
    // they can't reference this module's hashed classes
    <ul className={styles.ProjectList} data-project-list="">
      {projectData.map((project) => (
        <ProjectRow key={project.slug} project={project} />
      ))}
    </ul>
  );
}
