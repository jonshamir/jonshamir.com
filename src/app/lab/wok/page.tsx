"use client";

import dynamic from "next/dynamic";

import { LabMenu } from "../components/LabMenu/LabMenu";

const Canvas = dynamic(() => import("./Canvas"), {
  ssr: false
});

export default function Page() {
  return (
    <>
      <LabMenu title="Wok Physics" description="yum" />
      <Canvas />
    </>
  );
}
