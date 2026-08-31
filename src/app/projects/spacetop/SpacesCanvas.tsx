"use client";

import { OrbitControls } from "@react-three/drei";

import {
  CANVAS_BG,
  ThreeCanvas
} from "../../../components/ThreeCanvas/ThreeCanvas";
import { Rect } from "../../lab/rect/Rect";
import { RectOutline } from "../../lab/rect/RectOutline";

type SpaceRectProps = {
  size: { x: number; y: number };
  radius: number;
  color: string;
  segments?: number;
  curveRadius?: number;
};

function SpaceRect({
  size,
  radius,
  color,
  segments = 32,
  curveRadius = 0
}: SpaceRectProps) {
  return (
    <>
      <Rect
        size={size}
        radius={radius}
        color={CANVAS_BG}
        segments={segments}
        curveRadius={curveRadius}
        depthWrite
      />
      <RectOutline
        size={size}
        radius={radius}
        color={color}
        lineWidth={5}
        segments={segments}
        curveRadius={curveRadius}
        depthBias={-10}
        renderOrder={1}
      />
    </>
  );
}

export default function SpacesCanvas() {
  return (
    <ThreeCanvas
      camera={{ position: [0, 0, 10], zoom: 3.5 }}
      style={{ backgroundColor: CANVAS_BG, height: "30rem" }}
    >
      <OrbitControls enablePan={false} enableZoom={false} />
      <SpaceRect
        size={{ x: 3, y: 2 }}
        radius={0.25}
        color="#5772ad"
        curveRadius={4}
      />
    </ThreeCanvas>
  );
}
