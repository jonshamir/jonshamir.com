"use client";

import { OrbitControls } from "@react-three/drei";
import { ThreeElements, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { Rect } from "../../lab/rect/Rect";
import { RectOutline } from "../../lab/rect/RectOutline";

const CANVAS_R = 4;

// WebGL can't read CSS vars, so the palette is mirrored here per color mode.
// `bg` matches --color-bg and doubles as an opaque mask behind panels.
type Theme = {
  bg: string;
  line: string;
  fill: string;
  grid: string;
  deviceFill: string;
  deviceLine: string;
};

const THEMES: Record<"dark" | "light", Theme> = {
  dark: {
    bg: "#1e1e1e",
    line: "#5772ad",
    fill: "#2c3a57",
    grid: "#2c3a57",
    deviceFill: "#353434",
    deviceLine: "#828181"
  },
  light: {
    bg: "#f0f0f0",
    line: "#4a63a8",
    fill: "#5772ad",
    grid: "#aab6d6",
    deviceFill: "#929292",
    deviceLine: "#313131"
  }
};

function useTheme(): Theme {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark ? THEMES.dark : THEMES.light;
}

type SpaceRectProps = {
  size: { x: number; y: number };
  radius: number;
  color: string;
  fillColor: string;
  fillOpacity?: number;
  lineWidth?: number;
  segments?: number;
  curveRadius?: number;
  gridCols?: number;
  gridRows?: number;
  gridColor?: string;
  gridWidth?: number;
  depthWrite?: boolean;
  position?: ThreeElements["group"]["position"];
  rotation?: ThreeElements["group"]["rotation"];
};

function SpaceRect({
  size,
  radius,
  color,
  fillColor,
  fillOpacity = 1,
  lineWidth = 4,
  segments = 32,
  curveRadius = 0,
  gridCols = 0,
  gridRows = 0,
  gridColor = "#2c3a57",
  gridWidth = 1,
  depthWrite = true,
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
        color={fillColor}
        opacity={fillOpacity}
        segments={segments}
        curveRadius={curveRadius}
        gridCols={gridCols}
        gridRows={gridRows}
        gridColor={gridColor}
        gridWidth={gridWidth}
        polygonOffsetFactor={fillOffsetFactor}
        depthWrite={depthWrite}
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
  theme: Theme;
};

function CanvasWindow({
  angle,
  height,
  size,
  depth = 0.1,
  theme
}: CanvasWindowProps) {
  const CANVAS_R = 4;
  const WIN_ANGLE = angle;

  return (
    <SpaceRect
      size={size}
      radius={0}
      color={theme.line}
      fillColor={theme.bg}
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
  const theme = useTheme();

  return (
    <ThreeCanvas
      camera={{ position: [0, 0, 10], zoom: 3.5 }}
      gl={{ alpha: true }}
      style={{ height: "30rem" }}
    >
      <OrbitControls enablePan={false} enableZoom={false} />
      {/* Canvas Space */}
      <SpaceRect
        size={{ x: 8, y: 3 }}
        radius={0.2}
        color={theme.line}
        fillColor={theme.fill}
        fillOpacity={0.2}
        curveRadius={CANVAS_R}
        position={[0, 0, -2]}
        gridCols={16}
        gridRows={6}
        gridColor={theme.grid}
        gridWidth={2}
        depthWrite={false}
      />

      {/* Windows */}
      <CanvasWindow
        angle={0.1}
        height={0.5}
        size={{ x: 1.2, y: 1 }}
        theme={theme}
      />
      <CanvasWindow
        angle={-0.3}
        height={0.8}
        size={{ x: 1.4, y: 1 }}
        theme={theme}
      />

      {/* User Space */}
      <SpaceRect
        size={{ x: 3, y: 1 }}
        radius={0.2}
        color={theme.line}
        fillColor={theme.bg}
        curveRadius={3.5}
        position={[0, -0.2, -1.5]}
        gridCols={6}
        gridRows={2}
        gridColor={theme.grid}
        gridWidth={2}
      />

      {/* Homebar */}
      <SpaceRect
        size={{ x: 1, y: 0.2 }}
        radius={0.5}
        color={theme.line}
        fillColor={theme.bg}
        curveRadius={0}
        position={[0, -0.4, -1]}
        rotation={[-0.4, 0, 0]}
      />

      {/* Spacetop — the physical laptop */}
      <SpaceRect
        size={{ x: 0.6, y: 0.6 }}
        radius={0.16}
        color={theme.deviceLine}
        fillColor={theme.deviceFill}
        curveRadius={0}
        position={[0, -0.65, 0]}
        rotation={[-1.2, 0, 0]}
      />

      {/* Keyboard */}
      <SpaceRect
        lineWidth={2}
        size={{ x: 0.44, y: 0.26 }}
        radius={0.05}
        color={theme.deviceLine}
        fillColor={theme.deviceFill}
        curveRadius={0}
        position={[0, -0.6, -0.08]}
        rotation={[-1.2, 0, 0]}
        gridCols={8}
        gridRows={5}
        gridWidth={2}
        gridColor={theme.deviceLine}
      />

      {/* Trackpad */}
      <SpaceRect
        lineWidth={2}
        size={{ x: 0.24, y: 0.16 }}
        radius={0.05}
        color={theme.deviceLine}
        fillColor={theme.deviceLine}
        fillOpacity={0.3}
        curveRadius={0}
        position={[0, -0.7, 0.15]}
        rotation={[-1.2, 0, 0]}
        gridColor={theme.deviceLine}
      />
    </ThreeCanvas>
  );
}
