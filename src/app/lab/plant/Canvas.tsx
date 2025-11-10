"use client";

import { OrbitControls } from "@react-three/drei";
import { Leva, useControls } from "leva";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { Plant } from "./Plant";

export default function PlantCanvas() {
  const { currAge } = useControls({
    currAge: { value: 18, min: 0, max: 200 }
  });

  return (
    <>
      <Leva />
      <ThreeCanvas camera={{ fov: 15, position: [0, 0, -5] }}>
        <OrbitControls />
        <Plant age={currAge} position={[0, -0.5, 0]} />
      </ThreeCanvas>
    </>
  );
}
