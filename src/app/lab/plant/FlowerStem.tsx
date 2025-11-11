import { useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Euler,
  Group,
  Mesh,
  MeshBasicMaterial,
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
}

const curveSamples = 16;

export function FlowerStem({
  growingStage,
  baseColor,
  shadowColor,
  subsurfaceColor,
  baseRadius = 0.015,
  tipRadius = 0.008,
  ...props
}: FlowerStemProps) {
  const groupRef = useRef<Group>(null);
  const stemMeshRef = useRef<Mesh>(null);
  const flowerMeshRef = useRef<Mesh>(null);
  const materialRef = useRef<LeafMaterial>(null);

  // Create material once for the stem
  const stemMaterial = useMemo(() => new LeafMaterial(), []);

  // Create material for the flower (simple blue material)
  const flowerMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: 0x4d9eff,
        side: 2 // DoubleSide
      }),
    []
  );

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

    // Position the flower at the tip of the stem
    if (flowerMeshRef.current) {
      const tipPoint = curve.getPointAt(1);
      flowerMeshRef.current.position.set(tipPoint.x, tipPoint.y, tipPoint.z);

      // Scale flower with growth
      const flowerScale = Math.max(0, growingStage - 0.5) * 2; // Flower appears at 50% growth
      flowerMeshRef.current.scale.setScalar(flowerScale * 0.1);
    }
  }, [growingStage, baseRadius, tipRadius]);

  return (
    <group {...props} ref={groupRef}>
      {/* Stem */}
      <mesh ref={stemMeshRef} castShadow receiveShadow>
        <primitive object={stemMaterial} ref={materialRef} attach="material" />
      </mesh>
      {/* Flower - simple blue quad */}
      <mesh ref={flowerMeshRef}>
        <planeGeometry args={[1, 1]} />
        <primitive object={flowerMaterial} attach="material" />
      </mesh>
    </group>
  );
}
