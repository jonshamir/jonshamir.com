"use client";

import { OrbitControls } from "@react-three/drei";
import { ThreeElements, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";

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
    deviceFill: "#414141",
    deviceLine: "#777777"
  },
  light: {
    bg: "#f0f0f0",
    line: "#4a63a8",
    fill: "#5772ad",
    grid: "#aab6d6",
    deviceFill: "#929292",
    deviceLine: "#4d4d4d"
  }
};

const THEME_KEYS = [
  "bg",
  "line",
  "fill",
  "grid",
  "deviceFill",
  "deviceLine"
] as const;

type ThemeBytes = Record<(typeof THEME_KEYS)[number], [number, number, number]>;

function hexToBytes(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function paletteBytes(theme: Theme): ThemeBytes {
  const out = {} as ThemeBytes;
  for (const k of THEME_KEYS) out[k] = hexToBytes(theme[k]);
  return out;
}

const THEME_BYTES = {
  light: paletteBytes(THEMES.light),
  dark: paletteBytes(THEMES.dark)
};

// Interpolate the two palettes in sRGB byte space (not THREE.Color, which would
// lerp in linear space and drift from the page's --color-* CSS transitions).
function lerpTheme(t: number): Theme {
  const out = {} as Theme;
  for (const k of THEME_KEYS) {
    const a = THEME_BYTES.light[k];
    const b = THEME_BYTES.dark[k];
    const n =
      (Math.round(a[0] + (b[0] - a[0]) * t) << 16) |
      (Math.round(a[1] + (b[1] - a[1]) * t) << 8) |
      Math.round(a[2] + (b[2] - a[2]) * t);
    out[k] = "#" + (n | (1 << 24)).toString(16).slice(1);
  }
  return out;
}

function readDarkMode(style: CSSStyleDeclaration): number {
  const v = Number(style.getPropertyValue("--dark-mode"));
  return Number.isNaN(v) ? 0 : v;
}

// The site transitions --dark-mode 0->1 over 250ms on theme toggle; sampling it
// each frame drives the color lerp in sync with the rest of the page.
function FrameSampler({ onSample }: { onSample: (t: number) => void }) {
  const style = useMemo(() => getComputedStyle(document.documentElement), []);
  const last = useRef(-1);
  useFrame(() => {
    const t = readDarkMode(style);
    if (Math.abs(t - last.current) > 1e-4) {
      last.current = t;
      onSample(t);
    }
  });
  return null;
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
  const [t, setT] = useState(() =>
    readDarkMode(getComputedStyle(document.documentElement))
  );
  const theme = useMemo(() => lerpTheme(t), [t]);

  return (
    <ThreeCanvas
      camera={{ position: [0, 0, 10], zoom: 3.5 }}
      gl={{ alpha: true }}
      style={{ height: "30rem" }}
    >
      <FrameSampler onSample={setT} />
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
