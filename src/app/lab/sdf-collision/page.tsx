"use client";

import dynamic from "next/dynamic";

import { LabMenu } from "../components/LabMenu/LabMenu";

const Canvas = dynamic(() => import("./SdfCollisionCanvas"), {
  ssr: false
});

export default function Page() {
  return (
    <>
      <LabMenu
        title="SDF Collision"
        description="2D SDF physics with smooth blending"
      />
      <Canvas />
    </>
  );
}
