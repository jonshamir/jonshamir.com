import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Curve,
  Euler,
  Group,
  Mesh,
  QuadraticBezierCurve3,
  Vector3
} from "three";

import { LeafMaterial } from "./leafMaterial";
import { getStemVertices } from "./utils";

interface FlowerStemProps {
  position?: [number, number, number];
  growingStage: number; // 0 = new, 1 = fully grown
  rotation?: Euler;
  baseColor?: Color;
  shadowColor?: Color;
  subsurfaceColor?: Color;
  baseRadius?: number;
  tipRadius?: number;
  renderFlower?: (
    tipPosition: Vector3,
    flowerScale: number,
    curve: Curve<Vector3>
  ) => ReactNode;
}

const curveSamples = 16;

export function FlowerStem({
  growingStage,
  baseColor,
  shadowColor,
  subsurfaceColor,
  baseRadius = 0.015,
  tipRadius = 0.008,
  renderFlower,
  ...props
}: FlowerStemProps) {
  const groupRef = useRef<Group>(null);
  const stemMeshRef = useRef<Mesh>(null);
  const materialRef = useRef<LeafMaterial>(null);

  // State to track tip position and curve for custom flower rendering
  const [tipPosition, setTipPosition] = useState(new Vector3(0, 0, 0));
  const [flowerScale, setFlowerScale] = useState(0);
  const [stemCurve, setStemCurve] = useState<Curve<Vector3>>(
    new QuadraticBezierCurve3(
      new Vector3(0, 0, 0),
      new Vector3(0, 0, 0),
      new Vector3(0, 0, 0)
    )
  );

  // Create material once for the stem
  const stemMaterial = useMemo(() => new LeafMaterial(), []);

  // Update material age when growingStage changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.age = growingStage;
    }
  }, [growingStage]);

  // Update material colors
  useEffect(() => {
    if (materialRef.current && baseColor) {
      materialRef.current.baseColor = baseColor;
    }
  }, [baseColor]);

  useEffect(() => {
    if (materialRef.current && shadowColor) {
      materialRef.current.shadowColor = shadowColor;
    }
  }, [shadowColor]);

  useEffect(() => {
    if (materialRef.current && subsurfaceColor) {
      materialRef.current.subsurfaceColor = subsurfaceColor;
    }
  }, [subsurfaceColor]);

  // Update stem geometry and flower position
  useEffect(() => {
    const length = 1.7 * growingStage;
    const curve = new QuadraticBezierCurve3(
      new Vector3(0, 0, 0), // Start point
      new Vector3(-0.05, 0.6 * length, 0.1), // Control point (slight curve)
      new Vector3(-0.1, length, 0) // End point
    );

    const { vertices, indices, localX, localY, localZ } = getStemVertices(
      curveSamples,
      curve,
      growingStage,
      baseRadius,
      tipRadius
    );

    if (stemMeshRef.current) {
      const geometry = new BufferGeometry();
      geometry.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(vertices), 3)
      );
      geometry.setIndex(indices);
      geometry.computeVertexNormals(); // Compute smooth normals

      // Add custom attributes for shader
      geometry.setAttribute(
        "localX",
        new BufferAttribute(new Float32Array(localX), 1)
      );
      geometry.setAttribute(
        "localY",
        new BufferAttribute(new Float32Array(localY), 1)
      );
      geometry.setAttribute(
        "localZ",
        new BufferAttribute(new Float32Array(localZ), 1)
      );

      stemMeshRef.current.geometry = geometry;
    }

    // Update tip position, curve, and flower scale for custom rendering
    const tipPoint = curve.getPointAt(1);
    setTipPosition(tipPoint);
    setStemCurve(curve);

    const newFlowerScale = Math.max(0, growingStage - 0.5) * 2; // Flower appears at 50% growth
    setFlowerScale(newFlowerScale);
  }, [growingStage, baseRadius, tipRadius]);

  return (
    <group {...props} ref={groupRef}>
      {/* Stem */}
      <mesh ref={stemMeshRef} castShadow receiveShadow>
        <primitive object={stemMaterial} ref={materialRef} attach="material" />
      </mesh>
      {/* Flower */}
      {renderFlower && renderFlower(tipPosition, flowerScale, stemCurve)}
    </group>
  );
}
