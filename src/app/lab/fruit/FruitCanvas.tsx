"use client";

import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { WebGPURenderer } from "three/webgpu";
import { useDebounceCallback, useLocalStorage } from "usehooks-ts";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { TweakpanePanel } from "../../../components/TweakpanePanel";
import type { Preset } from "../../../lib/presets/presetStore";
import { usePresetFolder } from "../../../lib/presets/usePresetFolder";
import { type ControlValues, useControls } from "../../../lib/tweakpane";
import { Fruit } from "./Fruit";
import {
  colorSchema,
  grainSchema,
  motionSchema,
  shadingSchema,
  shapeSchema,
  subdivisionSchema,
  topSchema
} from "./fruitControls";
import { fruitPresets } from "./fruitPresets";
import builtIns from "./presets.json";
import { fruitTransition } from "./presetTransition";
import { ProfileEditor, useProfileEditorSlot } from "./ProfileEditor";

const BUILT_IN: Record<string, ControlValues> = builtIns;

export default function FruitCanvas() {
  // Folders appear in call order: Presets, Colors, the Profile editor, then
  // Shape.
  usePresetFolder(fruitPresets, BUILT_IN, fruitTransition);

  const colors = useControls("Colors", colorSchema, { collapsed: true });
  const profileSlot = useProfileEditorSlot();
  const shape = useControls("Shape", shapeSchema);
  const subdivisions = useControls("Subdivisions", subdivisionSchema);
  const top = useControls("Top", topSchema);
  const shading = useControls("Shading", shadingSchema, { collapsed: true });
  const grain = useControls("Grain", grainSchema, { collapsed: true });
  const motion = useControls("Motion", motionSchema, { collapsed: true });

  const [session, setSession] = useLocalStorage<Preset | null>(
    fruitPresets.sessionKey,
    null
  );

  // Declared after the useControls calls on purpose. Effects run in declaration
  // order within a component, so by the time this fires every folder has
  // registered itself and the restore can find its bindings. In a child
  // component it would run first and silently do nothing.
  useEffect(() => {
    const restored = fruitPresets.parse(session);
    if (restored) fruitPresets.apply(restored);
    // Mount only — this restores the working state once, and must not re-run
    // when the session is written back below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced so dragging a slider doesn't write to localStorage every frame.
  const saveSession = useDebounceCallback(setSession, 300);

  const {
    profileSegments,
    radialSegments,
    wireframe,
    jitterStrength,
    jitterScale,
    jitterSeed
  } = subdivisions;
  const {
    showTop,
    topSegments,
    topRadius,
    topAngle,
    topOffset,
    topShapeCenter,
    topShapeEdge,
    topShapeSharpness
  } = top;

  // Uniforms rather than geometry inputs, so these never rebuild the mesh.
  const jitter = useMemo(
    () => ({ jitterStrength, jitterScale, jitterSeed }),
    [jitterStrength, jitterScale, jitterSeed]
  );

  const topShape = useMemo(
    () => ({ topShapeCenter, topShapeEdge, topShapeSharpness }),
    [topShapeCenter, topShapeEdge, topShapeSharpness]
  );

  useEffect(() => {
    saveSession(fruitPresets.capture());
  }, [colors, shape, subdivisions, top, shading, grain, motion, saveSession]);

  // Listed field by field rather than spread, so the display-only toggles don't
  // land in the dependencies and rebuild the geometry.
  const params = useMemo(
    () => ({
      ...shape,
      profileSegments,
      radialSegments,
      topSegments,
      topRadius,
      topAngle,
      topOffset
    }),
    [
      shape,
      profileSegments,
      radialSegments,
      topSegments,
      topRadius,
      topAngle,
      topOffset
    ]
  );

  return (
    <>
      <TweakpanePanel />
      {profileSlot &&
        createPortal(<ProfileEditor shape={shape} />, profileSlot)}
      <ThreeCanvas
        camera={{ fov: 35, position: [0, 0.6, 6] }}
        isFullscreen={true}
        // Transparent by default so the page background shows through. The
        // custom property is still honoured, so an ExperimentGrid tile can set
        // a backdrop without this needing to change.
        style={{ backgroundColor: "var(--canvas-bg, transparent)" }}
        // Awaiting init() here means the WebGL2 fallback has already been
        // resolved by the time R3F receives the renderer.
        gl={async (defaults) => {
          const renderer = new WebGPURenderer({
            canvas: defaults.canvas as HTMLCanvasElement,
            antialias: true,
            alpha: true
          });
          await renderer.init();
          return renderer;
        }}
      >
        <OrbitControls makeDefault minDistance={2} maxDistance={20} />
        <Fruit
          params={params}
          jitter={jitter}
          shading={shading}
          grain={grain}
          motion={motion}
          colors={colors}
          topShape={topShape}
          showTop={showTop}
          wireframe={wireframe}
        />
      </ThreeCanvas>
    </>
  );
}
