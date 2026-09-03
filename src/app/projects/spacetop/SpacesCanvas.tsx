"use client";

import { OrbitControls } from "@react-three/drei";
import { ThreeElements, useThree } from "@react-three/fiber";

import {
  CANVAS_BG,
  ThreeCanvas
} from "../../../components/ThreeCanvas/ThreeCanvas";
import { Rect } from "../../lab/rect/Rect";
import { RectOutline } from "../../lab/rect/RectOutline";

const CANVAS_R = 4;

type SpaceRectProps = {
  size: { x: number; y: number };
  radius: number;
  color: string;
  lineWidth?: number;
  segments?: number;
  curveRadius?: number;
  gridCols?: number;
  gridRows?: number;
  gridColor?: string;
  gridWidth?: number;
  position?: ThreeElements["group"]["position"];
  rotation?: ThreeElements["group"]["rotation"];
};

function SpaceRect({
  size,
  radius,
  color,
  lineWidth = 4,
  segments = 32,
  curveRadius = 0,
  gridCols = 0,
  gridRows = 0,
  gridColor = "#2c3a57",
  gridWidth = 1,
  position,
  rotation
}: SpaceRectProps) {
  const dpr = useThree((state) => state.viewport.dpr);
  // Push the fill's depth behind the outline ribbon across the ribbon's full
  // width: half the line width in device pixels, plus margin for join caps.
  const fillOffsetFactor = (lineWidth * dpr) / 2 + 2;

  return (
    <group position={position} rotation={rotation}>
      <Rect
        size={size}
        radius={radius}
        color={CANVAS_BG}
        segments={segments}
        curveRadius={curveRadius}
        gridCols={gridCols}
        gridRows={gridRows}
        gridColor={gridColor}
        gridWidth={gridWidth}
        polygonOffsetFactor={fillOffsetFactor}
        depthWrite
      />
      <RectOutline
        size={size}
        radius={radius}
        color={color}
        lineWidth={lineWidth}
        segments={segments}
        curveRadius={curveRadius}
        depthBias={-10}
        renderOrder={1}
      />
    </group>
  );
}

type CanvasWindowProps = {
  angle: number;
  height: number;
  size: { x: number; y: number };
  depth?: number;
};

function CanvasWindow({ angle, height, size, depth = 0.1 }: CanvasWindowProps) {
  const CANVAS_R = 4;
  const WIN_ANGLE = angle;

  return (
    <SpaceRect
      size={size}
      radius={0}
      color="#5772ad"
      curveRadius={CANVAS_R - depth}
      position={[
        Math.sin(WIN_ANGLE) * (CANVAS_R - depth),
        height,
        2 - Math.cos(WIN_ANGLE) * (CANVAS_R - depth)
      ]}
      rotation={[0, -WIN_ANGLE, 0]}
    />
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
        curveRadius={CANVAS_R}
        position={[0, 0, -2]}
        gridCols={16}
        gridRows={6}
        gridWidth={2}
      />

      {/* Windows */}
      <CanvasWindow angle={0.1} height={0.5} size={{ x: 1.2, y: 1 }} />
      <CanvasWindow angle={-0.3} height={0.8} size={{ x: 1.4, y: 1 }} />

      {/* User Space */}
      <SpaceRect
        size={{ x: 3, y: 1 }}
        radius={0.2}
        color="#5772ad"
        curveRadius={3.5}
        position={[0, -0.2, -1.5]}
        gridCols={6}
        gridRows={2}
        gridWidth={2}
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

      {/* Spacetop */}
      <SpaceRect
        size={{ x: 0.6, y: 0.6 }}
        radius={0.2}
        color="#5772ad"
        curveRadius={0}
        position={[0, -0.65, 0]}
        rotation={[-1.2, 0, 0]}
      />

      {/* Keyboard */}
      <SpaceRect
        lineWidth={2}
        size={{ x: 0.4, y: 0.3 }}
        radius={0.05}
        color="#5772ad"
        curveRadius={0}
        position={[0, -0.65, 0.05]}
        rotation={[-1.2, 0, 0]}
        gridCols={8}
        gridRows={5}
        gridWidth={2}
      />
    </ThreeCanvas>
  );
}
