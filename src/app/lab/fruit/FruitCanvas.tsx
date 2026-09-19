"use client";

import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { WebGPURenderer } from "three/webgpu";
import { useDebounceCallback, useLocalStorage } from "usehooks-ts";

import {
  CANVAS_BG,
  ThreeCanvas
} from "../../../components/ThreeCanvas/ThreeCanvas";
import { TweakpanePanel } from "../../../components/TweakpanePanel";
import { useControls } from "../../../lib/tweakpane";
import { Fruit } from "./Fruit";
import {
  colorSchema,
  grainSchema,
  shadingSchema,
  shapeSchema,
  subdivisionSchema,
  topSchema
} from "./fruitControls";
import {
  applyPreset,
  capturePreset,
  type FruitPreset,
  parsePreset,
  SESSION_STORAGE_KEY
} from "./fruitPresets";
import { PresetBar } from "./PresetBar";

export default function FruitCanvas() {
  // Folders appear in call order, so Colors is declared first to sit at the top
  // of the panel.
  const colors = useControls("Colors", colorSchema, { collapsed: true });
  const shape = useControls("Shape", shapeSchema);
  const subdivisions = useControls("Subdivisions", subdivisionSchema);
  const top = useControls("Top", topSchema);
  const shading = useControls("Shading", shadingSchema, { collapsed: true });
  const grain = useControls("Grain", grainSchema, { collapsed: true });

  const [session, setSession] = useLocalStorage<FruitPreset | null>(
    SESSION_STORAGE_KEY,
    null
  );

  // Declared after the useControls calls on purpose. Effects run in declaration
  // order within a component, so by the time this fires every folder has
  // registered itself and the restore can find its bindings. In a child
  // component it would run first and silently do nothing.
  useEffect(() => {
    const restored = parsePreset(session);
    if (restored) applyPreset(restored);
    // Mount only — this restores the working state once, and must not re-run
    // when the session is written back below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced so dragging a slider doesn't write to localStorage every frame.
  const saveSession = useDebounceCallback(setSession, 300);

  const { profileSegments, radialSegments, wireframe } = subdivisions;
  const { showTop, topSegments, topDrop, topSpread, topLift, topTwist } = top;

  useEffect(() => {
    saveSession(capturePreset());
  }, [colors, shape, subdivisions, top, shading, grain, saveSession]);

  // Listed field by field rather than spread, so the display-only toggles don't
  // land in the dependencies and rebuild the geometry.
  const params = useMemo(
    () => ({
      ...shape,
      profileSegments,
      radialSegments,
      topSegments,
      topDrop,
      topSpread,
      topLift,
      topTwist
    }),
    [
      shape,
      profileSegments,
      radialSegments,
      topSegments,
      topDrop,
      topSpread,
      topLift,
      topTwist
    ]
  );

  return (
    <>
      <TweakpanePanel />
      <PresetBar />
      <ThreeCanvas
        camera={{ fov: 35, position: [0, 0.6, 6] }}
        isFullscreen={true}
        style={{ backgroundColor: `var(--canvas-bg, ${CANVAS_BG})` }}
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
          shading={shading}
          grain={grain}
          colors={colors}
          showTop={showTop}
          wireframe={wireframe}
        />
      </ThreeCanvas>
    </>
  );
}
