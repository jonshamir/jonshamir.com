"use client";

import { OrbitControls } from "@react-three/drei";
import { ThreeElements } from "@react-three/fiber";

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
  position?: ThreeElements["group"]["position"];
  rotation?: ThreeElements["group"]["rotation"];
};

function SpaceRect({
  size,
  radius,
  color,
  segments = 32,
  curveRadius = 0,
  position,
  rotation
}: SpaceRectProps) {
  return (
    <group position={position} rotation={rotation}>
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
    </group>
  );
}

export default function SpacesCanvas() {
  return (
    <ThreeCanvas
      camera={{ position: [0, 0, 10], zoom: 3.5 }}
      style={{ backgroundColor: CANVAS_BG, height: "30rem" }}
    >
      <OrbitControls enablePan={false} enableZoom={false} />
      {/* Canvas Space */}
      <SpaceRect
        size={{ x: 8, y: 3 }}
        radius={0.2}
        color="#5772ad"
        curveRadius={4}
        position={[0, 0, -2]}
      />
      {/* User Space */}
      <SpaceRect
        size={{ x: 3, y: 1 }}
        radius={0.2}
        color="#5772ad"
        curveRadius={3.5}
        position={[0, 0, -1.5]}
      />

      {/* Homebar */}
      <SpaceRect
        size={{ x: 1, y: 0.2 }}
        radius={0.5}
        color="#5772ad"
        curveRadius={0}
        position={[0, -0.4, -1]}
        rotation={[-0.4, 0, 0]}
      />

      {/* Keyboard */}
      <SpaceRect
        size={{ x: 0.6, y: 0.6 }}
        radius={0.2}
        color="#5772ad"
        curveRadius={0}
        position={[0, -0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </ThreeCanvas>
  );
}
