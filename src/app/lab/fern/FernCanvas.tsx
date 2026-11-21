"use client";

import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { MOUSE, type OrthographicCamera, TOUCH } from "three";
import { useDebounceCallback, useLocalStorage } from "usehooks-ts";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { TweakpanePanel } from "../../../components/TweakpanePanel";
import type { Preset } from "../../../lib/presets/presetStore";
import { usePresetFolder } from "../../../lib/presets/usePresetFolder";
import { type ControlValues, useControls } from "../../../lib/tweakpane";
import {
  colorSchema,
  frondSchema,
  outlineSchema,
  pinnaeSchema,
  pinnulesSchema,
  segmentsSchema,
  shadingSchema,
  venationSchema
} from "./fernControls";
import { fernPresets, fernTransition } from "./fernPresets";
import { FernRenderer } from "./FernRenderer";
import { generateFrond } from "./generator/generateFrond";
import builtIns from "./presets.json";

const BUILT_IN: Record<string, ControlValues> = builtIns;

const VIEW_CENTER: [number, number, number] = [0, -0.15, 0];
const VIEW_WIDTH = 1.1;
const VIEW_HEIGHT = 1.6;

function FitCamera() {
  const camera = useThree((s) => s.camera) as OrthographicCamera;
  const size = useThree((s) => s.size);

  useEffect(() => {
    camera.zoom = Math.min(size.width / VIEW_WIDTH, size.height / VIEW_HEIGHT);
    camera.updateProjectionMatrix();
    // Fit once on mount; afterwards zoom belongs to the controls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  return null;
}

export default function FernCanvas() {
  usePresetFolder(fernPresets, BUILT_IN, fernTransition);

  const frond = useControls("Frond", frondSchema);
  const pinnae = useControls("Pinnae", pinnaeSchema, { collapsed: true });
  const pinnules = useControls("Pinnules", pinnulesSchema, { collapsed: true });
  const segments = useControls("Segments", segmentsSchema, { collapsed: true });
  const outline = useControls("Outline", outlineSchema, { collapsed: true });
  const venation = useControls("Venation", venationSchema, { collapsed: true });
  const shading = useControls("Shading", shadingSchema, { collapsed: true });
  const colors = useControls("Colors", colorSchema, { collapsed: true });

  const [session, setSession] = useLocalStorage<Preset | null>(
    fernPresets.sessionKey,
    null
  );

  // After the useControls calls so every folder is registered before restore.
  useEffect(() => {
    const restored = fernPresets.parse(session);
    if (restored) fernPresets.apply(restored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSession = useDebounceCallback(setSession, 300);

  useEffect(() => {
    saveSession(fernPresets.capture());
  }, [
    frond,
    pinnae,
    pinnules,
    segments,
    outline,
    venation,
    shading,
    colors,
    saveSession
  ]);

  const geometry = useMemo(
    () =>
      generateFrond({
        frond,
        levels: [pinnae, pinnules, segments],
        outline,
        venation
      }),
    [frond, pinnae, pinnules, segments, outline, venation]
  );

  return (
    <>
      <TweakpanePanel />
      <ThreeCanvas
        orthographic
        camera={{ position: [VIEW_CENTER[0], VIEW_CENTER[1], 10], zoom: 400 }}
        isFullscreen={true}
        style={{ backgroundColor: "var(--canvas-bg, transparent)" }}
        gl={{ alpha: true, antialias: false }}
      >
        <FitCamera />
        <OrbitControls
          makeDefault
          target={VIEW_CENTER}
          enableRotate={false}
          zoomToCursor
          minZoom={50}
          maxZoom={40000}
          mouseButtons={{
            LEFT: MOUSE.PAN,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.PAN
          }}
          touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN }}
        />
        <FernRenderer
          frond={geometry}
          outline={outline}
          venation={venation}
          shading={shading}
          colors={colors}
        />
      </ThreeCanvas>
    </>
  );
}
