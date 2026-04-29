"use client";

import dynamic from "next/dynamic";

import { LabMenu } from "../components/LabMenu/LabMenu";

const Canvas = dynamic(() => import("./PointCloudCanvas"), {
  ssr: false
});

export default function Page() {
  return (
    <>
      <Canvas />
    </>
  );
}
