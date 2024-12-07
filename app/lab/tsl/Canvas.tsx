"use client";

import { OrbitControls } from "@react-three/drei";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { TSLTest } from "./TSLTest";

export default function Earth() {
  return (
    <>
      <ThreeCanvas
        className="full-bleed"
        camera={{ position: [0, 0, 200], zoom: 40 }}
        style={{ backgroundColor: "#101010", height: "40rem" }}
      >
        <color attach="background" args={["#101010"]} />
        <OrbitControls enablePan={false} enableZoom={true} />
        <TSLTest />
      </ThreeCanvas>
    </>
  );
}
