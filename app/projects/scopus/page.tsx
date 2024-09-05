"use client";

import { VideoEmbed } from "../../../components/VideoEmbed/VideoEmbed";

export default function Page() {
  return (
    <>
      <h1>Scopus</h1>
      <span className="description">Short 3D animation</span>
      <p>
        Mount Scopus and its brutalist architecture can be seen from practically
        anywhere in Jerusalem - clashing with the city's ancient architecture. I
        decided it might be used as a spaceship...{" "}
      </p>
      <p>Modeled & rendered using Cinema4D.</p>
      <VideoEmbed videoId="7KkArk0uCDQ" />
    </>
  );
}
