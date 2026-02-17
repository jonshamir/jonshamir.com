"use client";

import { useRef, useState } from "react";

const videos = [
  "/homepage/herbs.mp4",
  "/homepage/scopus.mp4",
  "/homepage/paint.mp4",
  "/homepage/earth.mp4",
  "/homepage/muser.mp4"
];

export function SelectedWork() {
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);
  const refs = [videoRefA, videoRefB];
  const [activeSlot, setActiveSlot] = useState(0);
  const [sources, setSources] = useState(() => {
    const i = Math.floor(Math.random() * videos.length);
    return [videos[i], videos[(i + 1) % videos.length]];
  });

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
    <figure className="grid-wide" style={{ height: "500px" }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
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
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: slot === activeSlot ? 1 : 0,
              visibility: slot === activeSlot ? "visible" : "hidden"
            }}
          />
        ))}
      </div>
    </figure>
  );
}
