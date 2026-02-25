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
  const tocRef = useRef<HTMLElement>(null);

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

  // Fade labels when wide/full grid items overlap the TOC
  useEffect(() => {
    const tocEl = tocRef.current;
    if (!tocEl) return;

    const overlapping = new Set<Element>();

    const createObserver = () => {
      const tocRect = tocEl.getBoundingClientRect();
      const topClip = Math.floor(tocRect.top);
      const bottomClip = Math.floor(window.innerHeight - tocRect.bottom);

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) overlapping.add(entry.target);
            else overlapping.delete(entry.target);
          }
          tocEl.toggleAttribute("data-faded", overlapping.size > 0);
        },
        { rootMargin: `-${topClip}px 0px -${bottomClip}px 0px` }
      );

      document
        .querySelectorAll(".grid-wide, .grid-full, .cover")
        .forEach((el) => {
          observer.observe(el);
        });

      return observer;
    };

    let observer = createObserver();

    const onResize = () => {
      observer.disconnect();
      overlapping.clear();
      observer = createObserver();
    };
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [tocItems]);

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <nav ref={tocRef} className={styles.toc}>
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
