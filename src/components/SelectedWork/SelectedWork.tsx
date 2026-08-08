"use client";

import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { useIntersectionObserver } from "usehooks-ts";

import styles from "./SelectedWork.module.css";

const videos = [
  "/homepage/herbs.mp4",
  "/homepage/scopus.mp4",
  "/homepage/paint.mp4",
  "/homepage/earth.mp4",
  "/homepage/muser.mp4"
];

export function SelectedWork({ className }: { className?: string }) {
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);
  const refs = [videoRefA, videoRefB];
  const [activeSlot, setActiveSlot] = useState(0);
  const [sources, setSources] = useState(() => {
    const i = Math.floor(Math.random() * videos.length);
    return [videos[i], videos[(i + 1) % videos.length]];
  });
  const { isIntersecting, ref: intersectionRef } = useIntersectionObserver({
    rootMargin: "25% 0% 25% 0%",
    threshold: 0
  });

  useEffect(() => {
    const video = (activeSlot === 0 ? videoRefA : videoRefB).current;
    if (!video) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (isIntersecting && !reducedMotion) {
      void video.play();
    } else {
      video.pause();
    }
  }, [isIntersecting, activeSlot, videoRefA, videoRefB]);

  const handleVideoEnd = () => {
    const nextSlot = 1 - activeSlot;
    const nextVideo = refs[nextSlot].current;
    if (!nextVideo) return;

    void nextVideo.play();
    setActiveSlot(nextSlot);

    // Preload the next video in the slot that just finished
    const nowPlayingSrc = sources[nextSlot];
    const nextSrc = videos[(videos.indexOf(nowPlayingSrc) + 1) % videos.length];
    setSources((prev) => prev.map((s, i) => (i === activeSlot ? nextSrc : s)));
  };

  return (
    <figure ref={intersectionRef} className={clsx(styles.figure, className)}>
      <div className={styles.frame}>
        {refs.map((ref, slot) => (
          <video
            key={slot}
            ref={ref}
            src={sources[slot]}
            autoPlay={slot === activeSlot}
            preload="auto"
            muted
            playsInline
            onEnded={slot === activeSlot ? handleVideoEnd : undefined}
            className={styles.video}
            style={{
              zIndex: slot === activeSlot ? 1 : 0,
              visibility: slot === activeSlot ? "visible" : "hidden"
            }}
          />
        ))}
      </div>
    </figure>
  );
}
