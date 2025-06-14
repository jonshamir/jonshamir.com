"use client";

import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("./Canvas"), {
  ssr: false
});

export default function CanvasWrapper() {
  return <Canvas />;
}
