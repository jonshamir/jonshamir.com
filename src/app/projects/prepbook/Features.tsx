"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

import styles from "./Features.module.css";

export type Feature = {
  id: string;
  title: string;
  src: string;
  label: string;
  content: ReactNode;
};

export function Features({ features }: { features: Feature[] }) {
  const [active, setActive] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const isDesktop = useMediaQuery("(min-width: 72rem)", {
    initializeWithValue: false
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = sectionRefs.current.indexOf(
            entry.target as HTMLElement
          );
          if (index !== -1) setActive(index);
        }
      },
      { rootMargin: "-30% 0px -70% 0px" }
    );
    for (const section of sectionRefs.current) {
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (isDesktop && index === active) {
        video.currentTime = 0;
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [active, isDesktop]);

  return (
    <div className={styles.features}>
      <div className={styles.stage}>
        <div className={styles.frame}>
          {features.map((feature, index) => (
            <video
              key={feature.id}
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              className={styles.stageVideo}
              data-active={index === active || undefined}
              aria-hidden={index !== active}
              src={feature.src}
              aria-label={feature.label}
              playsInline
              muted
              loop
              preload="auto"
            />
          ))}
        </div>
      </div>

      <div className={`flow ${styles.sections}`}>
        {features.map((feature, index) => (
          <section
            key={feature.id}
            ref={(el) => {
              sectionRefs.current[index] = el;
            }}
            className={`flow ${styles.section}`}
          >
            <figure className={styles.inlineClip}>
              <video
                className={styles.inlineVideo}
                src={feature.src}
                aria-label={feature.label}
                playsInline
                autoPlay
                muted
                loop
              />
            </figure>
            <h2
              className={styles.heading}
              data-active={index === active || undefined}
            >
              <span className={styles.arrowClip} aria-hidden>
                <span className="arrow">←</span>
              </span>
              {feature.title}
            </h2>
            {feature.content}
          </section>
        ))}
      </div>
    </div>
  );
}
