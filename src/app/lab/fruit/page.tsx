"use client";

import dynamic from "next/dynamic";

import { LabMenu } from "../components/LabMenu/LabMenu";

const Canvas = dynamic(() => import("./FruitCanvas"), {
  ssr: false
});

export default function Page() {
  return (
    <>
      <LabMenu
        title="Fruit"
        description="A revolved bezier profile with a fanned top, shaded in TSL"
      />
      <Canvas />
    </>
  );
}
