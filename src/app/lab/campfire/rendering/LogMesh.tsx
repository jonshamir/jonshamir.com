// src/app/lab/campfire/rendering/LogMesh.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { Group, Mesh, ShaderMaterial } from "three";

import type { LogModel } from "../simulation/types";
import { createSurfaceMaterial } from "./surfaceMaterial";

interface LogMeshProps {
  log: LogModel;
  showHeatmap: boolean;
  showSegmentIndices?: boolean;
  woodColor?: [number, number, number];
  radialSegments?: number;
}

export function LogMesh({
  log,
  showHeatmap,
  showSegmentIndices = false,
  woodColor = [0.55, 0.32, 0.15],
  radialSegments = 24
}: LogMeshProps) {
  const groupRef = useRef<Group>(null);

  // One material per segment. Reuse across renders; dispose on unmount.
  const materials = useMemo<ShaderMaterial[]>(() => {
    return log.segments.map((s) =>
      createSurfaceMaterial({
        textures: log.textures,
        uVMin: s.uvVRange[0],
        uVMax: s.uvVRange[1],
        segLength: s.length,
        woodColor,
        showHeatmap
      })
    );
    // Re-create only when segment topology changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log]);

  // Sync uniforms when toggles change.
  useEffect(() => {
    for (const m of materials) {
      m.uniforms.uShowHeatmap.value = showHeatmap ? 1 : 0;
      m.uniforms.uWoodColor.value = woodColor;
    }
  }, [materials, showHeatmap, woodColor]);

  useEffect(() => {
    return () => {
      for (const m of materials) m.dispose();
    };
  }, [materials]);

  // Position segments along the log's local Y axis, centred at log midpoint.
  const halfLength = log.totalLength / 2;

  return (
    <group ref={groupRef}>
      {log.segments.map((s, i) => (
        <SegmentMesh
          key={i}
          segment={s}
          material={materials[i]}
          radialSegments={radialSegments}
          yCenter={s.positionAlongAxis - halfLength}
        />
      ))}
      {showSegmentIndices &&
        log.segments.map((s, i) => (
          <mesh
            key={`marker-${i}`}
            position={[0, s.positionAlongAxis - halfLength, s.initialRadius * 1.4]}
          >
            <sphereGeometry args={[s.initialRadius * 0.1, 6, 6]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#ffffff" : "#000000"} />
          </mesh>
        ))}
    </group>
  );
}

interface SegmentMeshProps {
  segment: { initialRadius: number; length: number; radius: number; destroyed: boolean };
  material: ShaderMaterial;
  radialSegments: number;
  yCenter: number;
}

function SegmentMesh({ segment, material, radialSegments, yCenter }: SegmentMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const scaleXZ = Math.max(0.001, segment.radius / segment.initialRadius);

  return (
    <mesh
      ref={meshRef}
      position={[0, yCenter, 0]}
      scale={[scaleXZ, 1, scaleXZ]}
      visible={!segment.destroyed}
      material={material}
    >
      <cylinderGeometry args={[segment.initialRadius, segment.initialRadius, segment.length, radialSegments]} />
    </mesh>
  );
}
