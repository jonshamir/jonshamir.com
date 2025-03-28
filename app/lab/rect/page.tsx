"use client";

import { LabMenu } from "../components/LabMenu/LabMenu";
import Canvas from "./Canvas";

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
