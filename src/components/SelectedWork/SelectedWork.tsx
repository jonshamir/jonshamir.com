"use client";

import { useState } from "react";

const videos = [
  "homepage/herbs.mp4",
  "homepage/scopus.mp4",
  "homepage/earth.mp4",
  "homepage/muser.mp4"
];

export function SelectedWork() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(() =>
    Math.floor(Math.random() * videos.length)
  );

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  return (
    <figure className="full-bleed" style={{ height: "500px" }}>
      <video
        src={videos[currentVideoIndex]}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        style={{
          maxWidth: "1000px",
          width: "100%",
          height: "100%"
        }}
      />
    </figure>
  );
}
