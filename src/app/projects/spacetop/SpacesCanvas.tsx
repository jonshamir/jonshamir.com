"use client";

import { OrbitControls } from "@react-three/drei";
import { ThreeElements, useFrame, useThree } from "@react-three/fiber";
import {
  ComponentRef,
  Ref,
  RefObject,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import * as THREE from "three";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { easeOutCubic, lerp, saturate } from "../../../lib/math";
import type { CurveHandle } from "../../lab/rect/curvedPlaneGeometry";
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

// Everything the user reaches hangs off a pivot at this Z — the shared centre
// of curvature, effectively the user's head. Each one is a `Shell`: a distance
// out from the pivot, which for a curved surface is also its curve radius.
// Concentricity is then structural, so the hover breathe can move all of them
// at once and nothing drifts. Rotating about the pivot slides a panel along the
// canvas rather than off it.
const HEAD_Z = 2;
const CANVAS_R = 4;
// Windows sit just in front of the canvas surface.
const WINDOW_DEPTH = 0.1;
// User Space rests at CANVAS_R - this, i.e. 3.5.
const USER_DEPTH = 0.5;
// The homebar sits well inside the canvas, within arm's reach.
const HOMEBAR_DEPTH = 1;

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
    grid: "#3c527b",
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
// Three kinds of target exist so far: an outline's material (`refs.outlines`), a
// group's transform (`refs.sceneGroup`, `refs.groups`), and the concentric
// shells' radii (`refs.shells`), which is a geometry rewrite.
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

// A surface on its own shell around the head pivot. Its placement is a function
// of the canvas radius alone — see Shell — so the breathe hands every shell the
// same number and each one works out where that puts it.
type ShellHandle = { setCanvasRadius: (radius: number) => void };

type SceneRefs = {
  sceneGroup: RefObject<THREE.Group | null>;
  // Only the spaces whose behaviour lights up a rect have an outline here.
  outlines: Partial<Record<SpaceId, RefObject<RectOutlineRef | null>>>;
  // Spaces whose behaviour moves their own rect rather than the whole scene.
  groups: Partial<Record<SpaceId, RefObject<THREE.Group | null>>>;
  // Every curved surface, in mount order. Shells register themselves.
  shells: ShellHandle[];
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

// Sway back and forth around Y: 0 -> +peak -> 0 -> -peak. The phase only ever
// runs forward; hover progress scales the amplitude, so releasing fades the
// sway out where it stands instead of reversing the phase to chase a
// zero-crossing. Both terms are continuous, so there is no direction flip to
// feel — and letting go early can't buy a full excursion, because the envelope
// is already closing.
function swayY(
  target: THREE.Group | null,
  { p, dt, hovered, state }: AnimContext,
  swing: number,
  speed: number
) {
  if (!target) return;
  if (!hovered && p < REST_EPSILON) {
    // Settled. Park the phase so the next hover starts from rest, then leave
    // the group alone so another behaviour could claim it.
    if (state.phase !== 0) {
      state.phase = 0;
      target.rotation.y = 0;
    }
    return;
  }
  state.phase = (state.phase + dt * speed) % TWO_PI;
  target.rotation.y = swing * p * Math.sin(state.phase);
}

// Canvas Space breathes: its radius — and with it every other shell, each
// holding its offset — swings by CANVAS_SWING while hovered. Arc lengths are
// fixed, so the surface visibly wraps tighter as it closes in and flattens as
// it pulls away. Phase and envelope follow swayY's contract: sin starts at zero
// so engaging is continuous, and scaling by `p` fades the breathe out where it
// stands rather than reversing the phase to chase a zero-crossing.
function breatheShells(
  shells: ShellHandle[],
  { p, dt, hovered, state }: AnimContext,
  swing: number,
  speed: number
) {
  if (!hovered && p < REST_EPSILON) {
    if (state.phase !== 0) {
      state.phase = 0;
      for (const shell of shells) shell.setCanvasRadius(CANVAS_R);
    }
    return;
  }
  state.phase = (state.phase + dt * speed) % TWO_PI;
  const radius = CANVAS_R + swing * p * Math.sin(state.phase);
  for (const shell of shells) shell.setCanvasRadius(radius);
}

// Sign is which way it goes first: negative leads toward -Y rotation, i.e. the
// scene turns the other way than a bare positive amplitude would.
const WORK_SWING = -Math.PI / 8; // ±45° peaks of the Work Space sway
const WORK_SPEED = 2; // rad/s of the back-and-forth oscillation
// User Space is 3 wide on a shell of 3.5, so it subtends ≈ 0.86 rad of the
// canvas's 2 rad and a swing under ~0.57 rad keeps it on the surface — the
// margin only widens as the breathe pulls both further out. Slower than Work's:
// a follow, not a swing.
const USER_SWING = -0.3;
const USER_SPEED = 1.6;
// The canvas radius breathes CANVAS_R ± this, i.e. between 3.4 and 4.6. Slower
// again than the sways: a surface settling to a comfortable distance.
const CANVAS_SWING = 0.6;
const CANVAS_SPEED = 1.4;

const ANIMATIONS: Record<SpaceId, (ctx: AnimContext) => void> = {
  world: () => {}, // stub — describe the animation to fill this in
  work: (ctx) =>
    swayY(ctx.refs.sceneGroup.current, ctx, WORK_SWING, WORK_SPEED),
  // Disjoint again: the outline's material colour and the shells' geometry.
  canvas: (ctx) => {
    highlightOwnOutline(ctx);
    breatheShells(ctx.refs.shells, ctx, CANVAS_SWING, CANVAS_SPEED);
  },
  // The two compose because they write disjoint objects: the outline's material
  // colour and the pivot group's rotation.
  user: (ctx) => {
    highlightOwnOutline(ctx);
    swayY(ctx.refs.groups.user?.current ?? null, ctx, USER_SWING, USER_SPEED);
  },
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
  // One handle for the pair: the fill and the outline must bend together.
  curveRef?: Ref<CurveHandle>;
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
  curveRef,
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

  const fillCurve = useRef<CurveHandle>(null);
  const outlineCurve = useRef<CurveHandle>(null);
  useImperativeHandle(
    curveRef,
    () => ({
      setCurveRadius: (r: number) => {
        fillCurve.current?.setCurveRadius(r);
        outlineCurve.current?.setCurveRadius(r);
      }
    }),
    []
  );

  // Push the fill's depth behind the outline ribbon across the ribbon's full
  // width: half the line width in device pixels, plus margin for join caps.
  const fillOffsetFactor = (lineWidth * dpr) / 2 + 2;

  return (
    <group position={position} rotation={rotation}>
      <Rect
        curveRef={fillCurve}
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
        curveRef={outlineCurve}
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

type ShellProps = Omit<
  SpaceRectProps,
  "curveRadius" | "curveRef" | "position"
> & {
  shells: ShellHandle[];
  // Where the surface sits on the canvas: `depth` in front of it, `arc` along
  // it, `height` above its centre line. All three are what stays fixed as the
  // canvas breathes; the distance and yaw below are derived from them.
  depth?: number;
  arc?: number;
  height?: number;
  // A flat shell holds its place on the canvas but never takes its curvature.
  curved?: boolean;
};

// Placed by arc length, not by angle: the canvas keeps its arc length however
// it bends, so the point at `arc` moves to yaw arc/R as the radius changes.
// Pinning the angle instead would slide the surface across the canvas — and the
// yaw is the canvas tangent there too, so this also keeps it flush.
//
// Rendered inside the head pivot, so the yaw group and the radial offset put
// the surface exactly where a world-space sin/cos placement would.
function Shell({
  shells,
  depth = 0,
  arc = 0,
  height = 0,
  curved = true,
  ...rect
}: ShellProps) {
  const yaw = useRef<THREE.Group>(null);
  const radial = useRef<THREE.Group>(null);
  const curve = useRef<CurveHandle>(null);

  useEffect(() => {
    const handle: ShellHandle = {
      setCanvasRadius: (radius) => {
        const distance = radius - depth;
        if (yaw.current) yaw.current.rotation.y = -arc / radius;
        if (radial.current) radial.current.position.z = -distance;
        curve.current?.setCurveRadius(distance);
      }
    };
    shells.push(handle);
    return () => {
      const i = shells.indexOf(handle);
      if (i !== -1) shells.splice(i, 1);
    };
  }, [shells, depth, arc]);

  const distance = CANVAS_R - depth;

  return (
    <group ref={yaw} rotation={[0, -arc / CANVAS_R, 0]}>
      <group ref={radial} position={[0, height, -distance]}>
        <SpaceRect
          {...rect}
          curveRadius={curved ? distance : 0}
          curveRef={curved ? curve : undefined}
        />
      </group>
    </group>
  );
}

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
    outlines: { canvas: { current: null }, user: { current: null } },
    groups: { user: { current: null } },
    shells: []
  });

  return (
    <ThreeCanvas
      camera={{ position: [0, 0, 10], zoom: 2.1 }}
      gl={{ alpha: true }}
      // No tone mapping: this palette mirrors the page's CSS colours, and ACES
      // would shift them away from both the CSS and rect.glsl's sRGB encode.
      flat
      style={{ height: "var(--canvas-height, 38rem)" }}
    >
      <FrameSampler onSample={setT} />
      <OrbitIntro controls={controls} play={play} />
      <OrbitControls ref={controls} enablePan={false} enableZoom={false} />
      <SpaceAnimator refs={sceneRefs} theme={theme} hovered={hoveredSpace} />
      <group ref={sceneRefs.sceneGroup}>
        {/* Everything curved, on its shell around the head pivot. */}
        <group position={[0, 0, HEAD_Z]}>
          {/* Canvas Space */}
          <Shell
            shells={sceneRefs.shells}
            outlineRef={sceneRefs.outlines.canvas}
            size={{ x: 8, y: 3 }}
            radius={0.1}
            // Resting tone only: the hover animation owns this material's
            // colour from the first frame on.
            color={theme.grid}
            fillColor={theme.fill}
            fillOpacity={0.2}
            gridCols={16}
            gridRows={6}
            gridColor={theme.grid}
            gridWidth={2}
            depthWrite={false}
          />

          {/* Windows */}
          <Shell
            shells={sceneRefs.shells}
            depth={WINDOW_DEPTH}
            arc={0.8}
            height={0.5}
            size={{ x: 1.6, y: 1 }}
            radius={0}
            color={theme.grid}
            fillColor={theme.bg}
            lineWidth={2}
          />
          <Shell
            shells={sceneRefs.shells}
            depth={WINDOW_DEPTH}
            arc={-1.2}
            height={0.8}
            size={{ x: 1.6, y: 1 }}
            radius={0}
            color={theme.grid}
            fillColor={theme.bg}
            lineWidth={2}
          />

          {/* User Space. Its pivot is the head pivot's own origin, so the hover
              sway slides the rect along the canvas surface. */}
          <group ref={sceneRefs.groups.user}>
            <Shell
              shells={sceneRefs.shells}
              depth={USER_DEPTH}
              height={-0.2}
              outlineRef={sceneRefs.outlines.user}
              size={{ x: 3, y: 1 }}
              radius={0.1}
              // Resting tone only — see Canvas Space above.
              color={theme.grid}
              fillColor={theme.bg}
              gridCols={6}
              gridRows={2}
              gridColor={theme.grid}
              gridWidth={2}
            />
          </group>

          {/* Homebar. Flat, but it rides the canvas's distance. */}
          <Shell
            shells={sceneRefs.shells}
            depth={HOMEBAR_DEPTH}
            curved={false}
            height={-0.4}
            rotation={[-0.4, 0, 0]}
            size={{ x: 1, y: 0.2 }}
            radius={0.5}
            color={theme.grid}
            fillColor={theme.bg}
          />
        </group>

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
