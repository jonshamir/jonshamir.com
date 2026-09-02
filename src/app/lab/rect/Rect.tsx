import { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { createCurvedPlaneGeometry } from "./curvedPlaneGeometry";
import { fragmentShader, vertexShader } from "./rect.glsl";

// Remounts the material when the shader source changes (hot reload).
const materialKey = vertexShader + fragmentShader;

export type RectProps = ThreeElements["mesh"] & {
  size?: { x: number; y: number };
  color?: THREE.ColorRepresentation;
  depthTest?: boolean;
  depthWrite?: boolean;
  radius?: number;
  strokeWidth?: number;
  segments?: number;
  curveRadius?: number;
  gridCols?: number;
  gridRows?: number;
  gridColor?: THREE.ColorRepresentation;
  gridWidth?: number;
};

type RectUniforms = {
  uColor: { value: THREE.Color };
  uRadius: { value: THREE.Vector4 };
  uSize: { value: THREE.Vector2 };
  uStrokeWidth: { value: number };
  uGridCells: { value: THREE.Vector2 };
  uGridColor: { value: THREE.Color };
  uGridWidth: { value: number };
};

export function Rect(props: RectProps) {
  const {
    color = "",
    radius = 0,
    depthTest = true,
    depthWrite = false,
    size = { x: 1, y: 1 },
    strokeWidth = 0,
    segments = 1,
    curveRadius = 0,
    gridCols = 0,
    gridRows = 0,
    gridColor = color,
    gridWidth = 0,
    ...rest
  } = props;

  const uniformsRef = useRef<RectUniforms>({
    uColor: { value: new THREE.Color(color) },
    uRadius: { value: new THREE.Vector4(radius, radius, radius, radius) },
    uSize: { value: new THREE.Vector2(size.x, size.y) },
    uStrokeWidth: { value: strokeWidth },
    uGridCells: { value: new THREE.Vector2(gridCols, gridRows) },
    uGridColor: { value: new THREE.Color(gridColor) },
    uGridWidth: { value: gridWidth }
  });

  useEffect(() => {
    uniformsRef.current.uColor.value.set(color);
    const r = Math.min(radius, Math.min(size.x, size.y));
    uniformsRef.current.uRadius.value.set(r, r, r, r);
    uniformsRef.current.uSize.value.set(size.x, size.y);
    uniformsRef.current.uStrokeWidth.value = strokeWidth;
    uniformsRef.current.uGridCells.value.set(gridCols, gridRows);
    uniformsRef.current.uGridColor.value.set(gridColor);
    uniformsRef.current.uGridWidth.value = gridWidth;
  }, [
    color,
    radius,
    size.x,
    size.y,
    strokeWidth,
    gridCols,
    gridRows,
    gridColor,
    gridWidth
  ]);

  const geometry = useMemo(
    () => createCurvedPlaneGeometry(size.x, size.y, segments, curveRadius),
    [size.x, size.y, segments, curveRadius]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh {...rest} geometry={geometry}>
      <shaderMaterial
        key={materialKey}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthTest={depthTest}
        depthWrite={depthWrite}
        polygonOffset={depthWrite}
        // Must exceed half the overlaid outline's width in *device* pixels
        // (line width × DPR / 2, plus its round join caps): a Line2 ribbon
        // carries its centerline depth, so at grazing angles the fill surface
        // gets closer than the ribbon within the ribbon's own width.
        polygonOffsetFactor={8}
        polygonOffsetUnits={1}
        transparent={true}
        side={THREE.DoubleSide}
        uniforms={uniformsRef.current}
      />
    </mesh>
  );
}
