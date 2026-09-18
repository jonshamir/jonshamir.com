"use client";

import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { WebGPURenderer } from "three/webgpu";

import {
  CANVAS_BG,
  ThreeCanvas
} from "../../../components/ThreeCanvas/ThreeCanvas";
import { TweakpanePanel } from "../../../components/TweakpanePanel";
import { useControls } from "../../../lib/tweakpane";
import { Fruit } from "./Fruit";
import {
  colorSchema,
  shadingSchema,
  shapeSchema,
  subdivisionSchema,
  topSchema
} from "./fruitControls";

export default function FruitCanvas() {
  const shape = useControls("Shape", shapeSchema);
  const subdivisions = useControls("Subdivisions", subdivisionSchema);
  const top = useControls("Top", topSchema);
  const shading = useControls("Shading", shadingSchema, { collapsed: true });
  const colors = useControls("Colors", colorSchema, { collapsed: true });

  const { profileSegments, radialSegments, wireframe } = subdivisions;
  const { showTop, topSegments, topDrop, topSpread, topLift, topTwist } = top;

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
          colors={colors}
          showTop={showTop}
          wireframe={wireframe}
        />
      </ThreeCanvas>
    </>
  );
}
