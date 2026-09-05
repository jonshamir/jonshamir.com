"use client";

import { OrbitControls } from "@react-three/drei";
import { ThreeElements, useFrame, useThree } from "@react-three/fiber";
import { ComponentRef, Ref, RefObject, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { easeOutCubic, lerp, saturate } from "../../../lib/math";
import { Rect } from "../../lab/rect/Rect";
import { RectOutline, type RectOutlineRef } from "../../lab/rect/RectOutline";
import { INTRO_DURATION_MS, SPACE_IDS, type SpaceId } from "./spaces";

type OrbitControlsRef = ComponentRef<typeof OrbitControls>;

// Head-on (azimuth 0, polar π/2) is the OrbitControls default; the intro eases to
// a side-from-above framing the first time the canvas scrolls into view.
const HEAD_ON = { azimuth: 0, polar: Math.PI / 2 };
const SIDE_ABOVE = { azimuth: 0.6, polar: 1.2 };
const INTRO_DURATION = INTRO_DURATION_MS / 1000; // seconds

// Drives the OrbitControls angles directly (rather than rotating a group) so the
// controls' internal state stays consistent and dragging continues smoothly from
// the final orientation. Runs once, from the frame `play` first flips true.
function OrbitIntro({
  controls,
  play
}: {
  controls: RefObject<OrbitControlsRef | null>;
  play: boolean;
}) {
  const start = useRef<number | null>(null);
  const done = useRef(false);

  useFrame((state) => {
    const c = controls.current;
    if (!play || !c || done.current) return;
    if (start.current === null) start.current = state.clock.elapsedTime;
    const t = saturate(
      (state.clock.elapsedTime - start.current) / INTRO_DURATION
    );
    const e = easeOutCubic(t);
    c.setAzimuthalAngle(lerp(HEAD_ON.azimuth, SIDE_ABOVE.azimuth, e));
    c.setPolarAngle(lerp(HEAD_ON.polar, SIDE_ABOVE.polar, e));
    c.update();
    if (t >= 1) done.current = true;
  });

  return null;
}

const CANVAS_R = 4;
// Canvas Space sits at this Z; its centre of curvature is CANVAS_Z + CANVAS_R.
const CANVAS_Z = -2;

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

// --- Per-space hover animation framework ---------------------------------
//
// Hovering (or focusing) a list item on the page runs a bespoke behaviour for
// that space: some highlight their own rect's outline (Canvas, User), others
// drive a scene-wide motion with no highlight (Work sways every rect in unison).
//
// Each behaviour gets a context every frame: the eased hover progress `p`
// (0..1) for state-mapped anims, plus `dt` / `hovered` / a persistent per-space
// `state` for oscillators that own their own phase and must settle to rest on
// release rather than snap. Animations should target *disjoint* objects (during
// an enter/leave crossfade the last writer wins), and should leave their target
// untouched once fully at rest so a future behaviour can claim it.
//
// Adding one is two edits: wire that space's rect to `refs.outlines[id]` (or
// whatever object it drives) and fill in its `ANIMATIONS` entry.

// Approach speeds for the hover progress, in reciprocal seconds. Release is
// deliberately the faster of the two: engaging should feel like the scene is
// taking up the invitation, letting go like it drops it.
const ENGAGE_RATE = 6;
const RELEASE_RATE = 16;
const TWO_PI = Math.PI * 2;
// The exponential approach never reaches 0, so behaviours that want a true
// resting state need a threshold. At this amplitude the sway is under 0.05°.
const REST_EPSILON = 1e-3;

// Per-space scratch owned by SpaceAnimator: `p` is the eased hover progress,
// `phase` the oscillator position for behaviours that need one.
type SpaceState = { p: number; phase: number };

type SceneRefs = {
  sceneGroup: RefObject<THREE.Group | null>;
  // Only the spaces whose behaviour lights up a rect have an outline here.
  outlines: Partial<Record<SpaceId, RefObject<RectOutlineRef | null>>>;
};

// The two palette tones the highlight ramps between, pre-parsed once per theme
// step so the frame loop never re-parses a hex string.
type HighlightColors = { grid: THREE.Color; line: THREE.Color };

type AnimContext = {
  id: SpaceId; // the space this invocation is for
  p: number; // eased hover progress 0..1 (state-mapped anims)
  dt: number; // seconds since last frame
  hovered: boolean; // is THIS space hovered right now
  refs: SceneRefs;
  colors: HighlightColors;
  state: SpaceState;
};

// Outline-only "light up": opacity and width stay put; the colour eases from the
// dim `grid` tone at rest toward the brighter `line` tone when highlighted.
// Unlike `lerpTheme` above — which lerps sRGB bytes to track the page's CSS
// transition — this one interpolates in THREE's linear working space. Nothing
// in CSS is mirroring it, and linear gives the ramp a smoother midpoint.
function highlightOwnOutline({ id, p, refs, colors }: AnimContext) {
  const line = refs.outlines[id]?.current;
  if (!line) return;
  line.material.color.lerpColors(colors.grid, colors.line, easeOutCubic(p));
}

const WORK_SWING = Math.PI / 4; // 45° peak of the Work Space sway
const WORK_SPEED = 2; // rad/s of the back-and-forth oscillation

const ANIMATIONS: Record<SpaceId, (ctx: AnimContext) => void> = {
  world: () => {}, // stub — describe the animation to fill this in
  // Sway 0 -> 45° -> 0 around Y. The phase only ever runs forward; hover
  // progress scales the amplitude, so releasing fades the sway out where it
  // stands instead of reversing the phase to chase a zero-crossing. Both terms
  // are continuous, so there is no direction flip to feel — and letting go
  // early can't buy a full excursion, because the envelope is already closing.
  work: ({ p, dt, hovered, refs, state }) => {
    const g = refs.sceneGroup.current;
    if (!g) return;
    if (!hovered && p < REST_EPSILON) {
      // Settled. Park the phase so the next hover starts from rest, then leave
      // the group alone so another behaviour could claim it.
      if (state.phase !== 0) {
        state.phase = 0;
        g.rotation.y = 0;
      }
      return;
    }
    state.phase = (state.phase + dt * WORK_SPEED) % TWO_PI;
    g.rotation.y = WORK_SWING * p * (0.5 - 0.5 * Math.cos(state.phase));
  },
  canvas: highlightOwnOutline,
  user: highlightOwnOutline,
  head: () => {} // stub — describe the animation to fill this in
};

function createSpaceStates(): Record<SpaceId, SpaceState> {
  return Object.fromEntries(
    SPACE_IDS.map((id) => [id, { p: 0, phase: 0 }])
  ) as Record<SpaceId, SpaceState>;
}

// Advances each space's eased progress toward its hover target every frame and
// applies its animation. Lives inside the Canvas so it can use useFrame.
function SpaceAnimator({
  refs,
  theme,
  hovered
}: {
  refs: SceneRefs;
  theme: Theme;
  hovered: SpaceId | null;
}) {
  const statesRef = useRef<Record<SpaceId, SpaceState> | null>(null);
  statesRef.current ??= createSpaceStates();
  const states = statesRef.current;

  const colors = useMemo<HighlightColors>(
    () => ({
      grid: new THREE.Color(theme.grid),
      line: new THREE.Color(theme.line)
    }),
    [theme.grid, theme.line]
  );

  useFrame((_, dt) => {
    // Frame-rate-independent exponential approach, at whichever rate this
    // space is currently heading.
    const engage = 1 - Math.exp(-dt * ENGAGE_RATE);
    const release = 1 - Math.exp(-dt * RELEASE_RATE);
    for (const id of SPACE_IDS) {
      const state = states[id];
      const isHovered = hovered === id;
      state.p +=
        ((isHovered ? 1 : 0) - state.p) * (isHovered ? engage : release);
      ANIMATIONS[id]({
        id,
        p: state.p,
        dt,
        hovered: isHovered,
        refs,
        colors,
        state
      });
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
  outlineRef?: Ref<RectOutlineRef>;
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
  outlineRef,
  segments = 32,
  curveRadius = 0,
  gridCols = 0,
  gridRows = 0,
  gridColor,
  gridWidth = 1,
  depthWrite = true,
  position,
  rotation
}: SpaceRectProps) {
  // Rect's own gridColor default is its fill colour, which would draw an
  // invisible grid; fall back to the outline tone instead.
  const grid = gridColor ?? color;
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
        gridColor={grid}
        gridWidth={gridWidth}
        polygonOffsetFactor={fillOffsetFactor}
        depthWrite={depthWrite}
      />
      <RectOutline
        ref={outlineRef}
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
  // Inset from the Canvas Space surface so the window sits just in front of it.
  const r = CANVAS_R - depth;

  return (
    <SpaceRect
      size={size}
      radius={0}
      color={theme.grid}
      fillColor={theme.bg}
      curveRadius={r}
      position={[
        Math.sin(angle) * r,
        height,
        CANVAS_Z + CANVAS_R - Math.cos(angle) * r
      ]}
      rotation={[0, -angle, 0]}
    />
  );
}

// `play` is the section's cue to start the camera move: it owns the whole intro
// timeline (fade, then this, then the names), so the timing survives even if
// WebGL never starts.
export default function SpacesCanvas({
  hoveredSpace,
  play
}: {
  hoveredSpace: SpaceId | null;
  play: boolean;
}) {
  const [t, setT] = useState(() =>
    readDarkMode(getComputedStyle(document.documentElement))
  );
  const theme = useMemo(() => lerpTheme(t), [t]);

  const controls = useRef<OrbitControlsRef>(null);

  // Animations reach their target by space id, so adding a behaviour never
  // widens this type. Held in a ref, not a memo: these are identity-critical
  // mutable boxes and useMemo is allowed to discard its cache.
  const sceneRefsRef = useRef<SceneRefs | null>(null);
  const sceneRefs = (sceneRefsRef.current ??= {
    sceneGroup: { current: null },
    outlines: { canvas: { current: null }, user: { current: null } }
  });

  return (
    <ThreeCanvas
      camera={{ position: [0, 0, 10], zoom: 3.5 }}
      gl={{ alpha: true }}
      style={{ height: "30rem" }}
    >
      <FrameSampler onSample={setT} />
      <OrbitIntro controls={controls} play={play} />
      <OrbitControls ref={controls} enablePan={false} enableZoom={false} />
      <SpaceAnimator refs={sceneRefs} theme={theme} hovered={hoveredSpace} />
      <group ref={sceneRefs.sceneGroup}>
        {/* Canvas Space */}
        <SpaceRect
          outlineRef={sceneRefs.outlines.canvas}
          size={{ x: 8, y: 3 }}
          radius={0.2}
          // Resting tone only: the hover animation owns this material's
          // colour from the first frame on.
          color={theme.grid}
          fillColor={theme.fill}
          fillOpacity={0.2}
          curveRadius={CANVAS_R}
          position={[0, 0, CANVAS_Z]}
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
          outlineRef={sceneRefs.outlines.user}
          size={{ x: 3, y: 1 }}
          radius={0.2}
          // Resting tone only — see Canvas Space above.
          color={theme.grid}
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
      </group>
    </ThreeCanvas>
  );
}
