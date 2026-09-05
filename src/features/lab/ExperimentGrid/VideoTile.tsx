"use client";

import { useEffect, useRef } from "react";
import { useIntersectionObserver } from "usehooks-ts";

export function VideoTile({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isIntersecting, ref } = useIntersectionObserver({
    rootMargin: "25% 0% 25% 0%",
    threshold: 0
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (isIntersecting && !reducedMotion) {
      void video.play();
    } else {
      video.pause();
    }
  }, [isIntersecting]);

  return (
    <video
      ref={(el) => {
        videoRef.current = el;
        ref(el);
      }}
      src={src}
      autoPlay
      muted
      playsInline
      loop
      preload="metadata"
    />
  );
}
