"use client";

import { useEffect, useRef } from "react";

export function VideoTile({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ref.current?.pause();
    }
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      playsInline
      loop
      preload="metadata"
    />
  );
}
