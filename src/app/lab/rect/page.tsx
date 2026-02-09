"use client";

import dynamic from "next/dynamic";

import { LabMenu } from "../components/LabMenu/LabMenu";

const Canvas = dynamic(() => import("./RectCanvas"), {
  ssr: false
});

export default function Page() {
  return (
    <>
      <LabMenu
        title="Rect"
        description="Rectangles drawn in the fragment shader using SDFs"
      />
      <Canvas />
    </>
  );
}
