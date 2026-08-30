"use client";

import { OrbitControls } from "@react-three/drei";

import {
  CANVAS_BG,
  ThreeCanvas
} from "../../../components/ThreeCanvas/ThreeCanvas";
import { Rect } from "../../lab/rect/Rect";

export default function SpacesCanvas() {
  return (
    <ThreeCanvas
      camera={{ position: [0, 0, 10], zoom: 3.5 }}
      style={{ backgroundColor: CANVAS_BG, height: "30rem" }}
    >
      <OrbitControls enablePan={false} enableZoom={false} />
      <Rect
        size={{ x: 3, y: 2 }}
        radius={0.25}
        color="#5772ad"
        strokeWidth={5}
      />
    </ThreeCanvas>
  );
}
