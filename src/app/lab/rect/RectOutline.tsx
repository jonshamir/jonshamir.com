"use client";

import { Line } from "@react-three/drei";
import { useMemo } from "react";
import type { ColorRepresentation } from "three";

import { createRoundedRectContourPoints } from "./roundedRectContour";

export type RectOutlineProps = {
  size?: { x: number; y: number };
  radius?: number;
  color?: ColorRepresentation;
  lineWidth?: number;
  segments?: number;
  curveRadius?: number;
  cornerSegments?: number;
  depthBias?: number;
  position?: [number, number, number];
  renderOrder?: number;
};

export function RectOutline({
  size = { x: 1, y: 1 },
  radius = 0,
  color = "white",
  lineWidth = 5,
  segments = 1,
  curveRadius = 0,
  cornerSegments = 8,
  depthBias = 0,
  position,
  renderOrder = 0
}: RectOutlineProps) {
  const points = useMemo(
    () =>
      createRoundedRectContourPoints(
        size.x,
        size.y,
        radius,
        segments,
        curveRadius,
        cornerSegments
      ),
    [size.x, size.y, radius, segments, curveRadius, cornerSegments]
  );

  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      position={position}
      renderOrder={renderOrder}
      polygonOffset={depthBias !== 0}
      polygonOffsetFactor={depthBias}
      polygonOffsetUnits={depthBias}
      transparent
    />
  );
}
