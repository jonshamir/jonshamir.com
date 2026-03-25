"use client";

import { SideScroller } from "../../../components/SideScroller/SideScroller";

export function ProjectScroller() {
  return (
    <SideScroller>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          style={{
            width: "30rem",
            background: "var(--color-accent)",
            padding: "2rem",
            minHeight: "400px",
            display: "grid",
            placeItems: "center",
            borderRadius: "var(--rounding-medium)"
          }}
        >
          <h2>Slide {i + 1}</h2>
        </div>
      ))}
    </SideScroller>
  );
}
