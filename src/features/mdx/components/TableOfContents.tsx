"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./TableOfContents.module.css";

const SCROLL_DURATION = 300;

function smoothScrollTo(top: number) {
  const start = window.scrollY;
  const delta = top - start;
  const startTime = performance.now();

  function step(now: number) {
    const t = Math.min((now - startTime) / SCROLL_DURATION, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    window.scrollTo(0, start + delta * ease);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

interface TocItem {
  id: string;
  text: string;
}

export function TableOfContents() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const tocItemsRef = useRef<TocItem[]>([]);

  // Heading collection
  useEffect(() => {
    const headings = document.querySelectorAll("h2");
    const items: TocItem[] = [];

    headings.forEach((heading) => {
      const id = heading.id;
      const text = heading.textContent || "";
      if (id && text) {
        items.push({ id, text });
      }
    });

    setTocItems(items);
    tocItemsRef.current = items;
  }, []);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    if (tocItems.length === 0) return;

    const visibleIds = new Set<string>();
    let h1Visible = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.tagName === "H1") {
            h1Visible = entry.isIntersecting;
          } else {
            const id = entry.target.id;
            if (entry.isIntersecting) {
              visibleIds.add(id);
            } else {
              visibleIds.delete(id);
            }
          }
        });

        if (h1Visible) {
          setActiveId("");
          return;
        }

        // Pick the first visible heading in document order
        const currentItems = tocItemsRef.current;
        for (const item of currentItems) {
          if (visibleIds.has(item.id)) {
            setActiveId(item.id);
            return;
          }
        }
      },
      { rootMargin: "-80px 0px -66% 0px" }
    );

    const h1 = document.querySelector("h1");
    if (h1) observer.observe(h1);

    const headings = document.querySelectorAll("h2");
    headings.forEach((heading) => {
      if (heading.id) observer.observe(heading);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <nav className={styles.toc}>
      {tocItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`${styles.link} ${activeId === item.id ? styles.active : ""}`}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(item.id);
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY - 80;
              smoothScrollTo(top);
            }
          }}
        >
          <span className={styles.label}>{item.text}</span>
          <span className={styles.dot} />
        </a>
      ))}
    </nav>
  );
}
