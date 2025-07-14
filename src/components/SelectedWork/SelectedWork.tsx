"use client";

import { useState } from "react";

const videos = [
  "homepage/herbs.mp4",
  "homepage/earth.mp4",
  "homepage/muser.mp4"
];

export function SelectedWork() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  return (
    <figure className="full-bleed">
      <video
        src={videos[currentVideoIndex]}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        style={{
          maxWidth: "1000px",
          maxHeight: "500px",
          width: "100%"
        }}
      />
    </figure>
  );
}
