"use client";

import { Line } from "@react-three/drei";
import {
  ComponentRef,
  Ref,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef
} from "react";
import type { ColorRepresentation, InterleavedBufferAttribute } from "three";

import { type CurveHandle } from "./curvedPlaneGeometry";
import {
  bendContourInto,
  createRefinedContour,
  createRoundedRectContourPoints
} from "./roundedRectContour";

// The drei Line's underlying object. Each Line owns its own LineMaterial, so
// mutating `.material.color` through this ref animates one outline only.
export type RectOutlineRef = ComponentRef<typeof Line>;

export type RectOutlineProps = {
  size?: { x: number; y: number };
  radius?: number;
  color?: ColorRepresentation;
  lineWidth?: number;
  segments?: number;
  curveRadius?: number;
  // Drives the bend after mount. Needs a non-zero `curveRadius`: the flat case
  // builds an unsplit contour, whose point count the bent one doesn't match.
  curveRef?: Ref<CurveHandle>;
  cornerSegments?: number;
  depthBias?: number;
  position?: [number, number, number];
  renderOrder?: number;
  ref?: Ref<RectOutlineRef>;
};

export function RectOutline({
  size = { x: 1, y: 1 },
  radius = 0,
  color = "white",
  lineWidth = 5,
  segments = 1,
  curveRadius = 0,
  curveRef,
  cornerSegments = 8,
  depthBias = 0,
  position,
  renderOrder = 0,
  ref
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

  // Re-bending works off the unbent contour, so the curve radius is absent from
  // both of these: they outlive any number of radii.
  const contour = useMemo(
    () =>
      createRefinedContour(size.x, size.y, radius, segments, cornerSegments),
    [size.x, size.y, radius, segments, cornerSegments]
  );
  const bent = useMemo(() => new Float32Array(contour.length * 3), [contour]);

  // The handle needs the Line2 for itself, and callers need it for the material.
  const line = useRef<RectOutlineRef>(null);
  const setLine = useCallback(
    (instance: RectOutlineRef | null) => {
      line.current = instance;
      if (typeof ref === "function") ref(instance);
      else if (ref) ref.current = instance;
    },
    [ref]
  );

  useImperativeHandle(
    curveRef,
    () => ({
      setCurveRadius: (r: number) => {
        const geometry = line.current?.geometry;
        if (!geometry) return;
        const attribute = geometry.getAttribute(
          "instanceStart"
        ) as InterleavedBufferAttribute;
        const array = attribute.data.array as Float32Array;
        // LineGeometry stores a polyline as n-1 instanced segments of stride 6,
        // segment i being (point i, point i + 1). Writing that layout in place
        // beats setPositions, which builds a fresh buffer — and so a fresh GL
        // buffer — on every call.
        if (array.length !== (contour.length - 1) * 6) return;
        bendContourInto(contour, size.x, segments, r, bent);
        for (let i = 0; i < contour.length - 1; i++) {
          const a = i * 3;
          const o = i * 6;
          array[o] = bent[a];
          array[o + 1] = bent[a + 1];
          array[o + 2] = bent[a + 2];
          array[o + 3] = bent[a + 3];
          array[o + 4] = bent[a + 4];
          array[o + 5] = bent[a + 5];
        }
        attribute.data.needsUpdate = true;
        // computeBoundingSphere centres itself on the bounding box and only
        // builds one when it is missing, so the box has to be refreshed first
        // or culling works off the radius the line had at mount.
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
      }
    }),
    [contour, bent, size.x, segments]
  );

  return (
    <Line
      ref={setLine}
      points={points}
      color={color}
      lineWidth={lineWidth}
      position={position}
      renderOrder={renderOrder}
      polygonOffset={depthBias !== 0}
      polygonOffsetFactor={0}
      polygonOffsetUnits={depthBias}
      transparent
    />
  );
}
