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
  opacity?: number;
  depthTest?: boolean;
  depthWrite?: boolean;
  radius?: number;
  strokeWidth?: number;
  segments?: number;
  curveRadius?: number;
  polygonOffsetFactor?: number;
  gridCols?: number;
  gridRows?: number;
  gridColor?: THREE.ColorRepresentation;
  gridWidth?: number;
};

type RectUniforms = {
  uColor: { value: THREE.Color };
  uRadius: { value: THREE.Vector4 };
  uSize: { value: THREE.Vector2 };
  uOpacity: { value: number };
  uStrokeWidth: { value: number };
  uGridCells: { value: THREE.Vector2 };
  uGridColor: { value: THREE.Color };
  uGridWidth: { value: number };
};

export function Rect(props: RectProps) {
  const {
    color = "",
    opacity = 1,
    radius = 0,
    depthTest = true,
    depthWrite = false,
    size = { x: 1, y: 1 },
    strokeWidth = 0,
    segments = 1,
    curveRadius = 0,
    polygonOffsetFactor = 1,
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
    uOpacity: { value: opacity },
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
    uniformsRef.current.uOpacity.value = opacity;
    uniformsRef.current.uStrokeWidth.value = strokeWidth;
    uniformsRef.current.uGridCells.value.set(gridCols, gridRows);
    uniformsRef.current.uGridColor.value.set(gridColor);
    uniformsRef.current.uGridWidth.value = gridWidth;
  }, [
    color,
    opacity,
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
        // When a screen-space line is overlaid on this surface, the factor
        // must exceed half the line's width in device pixels — see SpaceRect.
        polygonOffsetFactor={polygonOffsetFactor}
        polygonOffsetUnits={1}
        transparent={true}
        side={THREE.DoubleSide}
        uniforms={uniformsRef.current}
      />
    </mesh>
  );
}
