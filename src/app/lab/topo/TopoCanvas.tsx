"use client";

import { folder, useControls } from "leva";
import { useEffect, useMemo, useState } from "react";

import { LevaPanel } from "../../../components/LevaPanel";
import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { HeightmapQuad } from "./HeightmapQuad";
import { TerrainMesh } from "./TerrainMesh";
import styles from "./TopoCanvas.module.css";
import {
  createTopoUniforms,
  syncLevaToUniforms,
  TOPO_DEFAULTS,
  type TopoControls
} from "./uniforms";
import clsx from "clsx";

type View = "3d" | "2d";

export default function TopoCanvas() {
  const [view, setView] = useState<View>("3d");
  const uniforms = useMemo(() => createTopoUniforms(), []);

  const controls = useControls({
    base: folder({
      baseAmplitude: {
        value: TOPO_DEFAULTS.baseAmplitude,
        min: 0,
        max: 0.5,
        step: 0.005,
        label: "Amplitude"
      },
      baseFrequency: {
        value: TOPO_DEFAULTS.baseFrequency,
        min: 0.1,
        max: 20,
        step: 0.1,
        label: "Frequency"
      },
      baseOctaves: {
        value: TOPO_DEFAULTS.baseOctaves,
        min: 1,
        max: 10,
        step: 1,
        label: "Octaves"
      },
      baseLacunarity: {
        value: TOPO_DEFAULTS.baseLacunarity,
        min: 1,
        max: 4,
        step: 0.05,
        label: "Lacunarity"
      },
      baseGain: {
        value: TOPO_DEFAULTS.baseGain,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Gain"
      }
    }),
    erosion: folder({
      erosionScale: {
        value: TOPO_DEFAULTS.erosionScale,
        min: 0.02,
        max: 0.5,
        step: 0.005,
        label: "Scale"
      },
      erosionStrength: {
        value: TOPO_DEFAULTS.erosionStrength,
        min: 0,
        max: 1,
        step: 0.005,
        label: "Strength"
      },
      erosionGullyWeight: {
        value: TOPO_DEFAULTS.erosionGullyWeight,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Gully weight"
      },
      erosionDetail: {
        value: TOPO_DEFAULTS.erosionDetail,
        min: 0.1,
        max: 4,
        step: 0.05,
        label: "Detail"
      },
      erosionOctaves: {
        value: TOPO_DEFAULTS.erosionOctaves,
        min: 1,
        max: 10,
        step: 1,
        label: "Octaves"
      },
      erosionLacunarity: {
        value: TOPO_DEFAULTS.erosionLacunarity,
        min: 1,
        max: 4,
        step: 0.05,
        label: "Lacunarity"
      },
      erosionGain: {
        value: TOPO_DEFAULTS.erosionGain,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Gain"
      }
    }),
    shape: folder({
      ridgeRounding: {
        value: TOPO_DEFAULTS.ridgeRounding,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Ridge rounding"
      },
      creaseRounding: {
        value: TOPO_DEFAULTS.creaseRounding,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Crease rounding"
      },
      erosionCellScale: {
        value: TOPO_DEFAULTS.erosionCellScale,
        min: 0.3,
        max: 1.5,
        step: 0.01,
        label: "Cell scale"
      },
      erosionNormalization: {
        value: TOPO_DEFAULTS.erosionNormalization,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Normalization"
      },
      heightOffset: {
        value: TOPO_DEFAULTS.heightOffset,
        min: -1,
        max: 1,
        step: 0.01,
        label: "Height offset"
      }
    }),
    rendering: folder({
      displacementScale: {
        value: TOPO_DEFAULTS.displacementScale,
        min: 0,
        max: 3,
        step: 0.05,
        label: "Displacement"
      }
    })
  });

  useEffect(() => {
    syncLevaToUniforms(controls as TopoControls, uniforms);
  }, [controls, uniforms]);

  return (
    <>
      <LevaPanel />
      <div className={clsx(styles.wrapper, "grid-full")}>
        <button
          className={styles.toggle}
          onClick={() => setView((v) => (v === "3d" ? "2d" : "3d"))}
          type="button"
        >
          View: {view.toUpperCase()}
        </button>
        <ThreeCanvas
          className="grid-full"
          style={{ height: "40rem" }}
          camera={{ position: [1.2, 1.2, 1.2], fov: 35 }}
        >
          {view === "3d" && <TerrainMesh uniforms={uniforms} />}
          {view === "2d" && <HeightmapQuad uniforms={uniforms} />}
        </ThreeCanvas>
      </div>
    </>
  );
}
