import { useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Euler,
  Mesh,
  QuadraticBezierCurve3,
  Vector3
} from "three";

import { PlantMaterial } from "./plantMaterial";
import { getLeafVertices } from "./utils";

const { pow } = Math;

interface LeafProps {
  position?: [number, number, number];
  growingStage: number; // 0 = new, 1 = fully grown
  dyingStage: number; // 0 = not dying, 1 = dead
  rotation?: Euler;
  baseColor?: Color;
  shadowColor?: Color;
  subsurfaceColor?: Color;
}

const curveSamples = 12;

export function CustomLeaf({
  growingStage,
  dyingStage,
  baseColor = new Color(0.2, 0.4, 0.24),
  shadowColor = new Color(0.06, 0.1, 0.15),
  subsurfaceColor = new Color(0.8, 1.0, 0.3),
  ...props
}: LeafProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<PlantMaterial>(null);

  // Create material once
  const material = useMemo(() => new PlantMaterial(), []);

  // Update material age when growingStage changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.age = growingStage;
    }
  }, [growingStage]);

  useEffect(() => {
    const length = 1 - 0.1 * pow(growingStage, 1);
    const curve = new QuadraticBezierCurve3(
      new Vector3(0, 0, 0), // Start point
      new Vector3(0, 0.5 * Math.pow(growingStage, 10), 0.7 * length), // Control point
      new Vector3(0, 0, length) // End point
    );
    const {
      vertices,
      indices,
      localX,
      localY,
      localZ,
      vertexBaseColors,
      vertexShadowColors,
      vertexSubsurfaceColors
    } = getLeafVertices(
      curveSamples,
      curve,
      growingStage,
      [baseColor.r, baseColor.g, baseColor.b],
      [shadowColor.r, shadowColor.g, shadowColor.b],
      [subsurfaceColor.r, subsurfaceColor.g, subsurfaceColor.b]
    );

    if (meshRef.current) {
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

      // Add color attributes
      geometry.setAttribute(
        "vertexBaseColor",
        new BufferAttribute(new Float32Array(vertexBaseColors), 3)
      );
      geometry.setAttribute(
        "vertexShadowColor",
        new BufferAttribute(new Float32Array(vertexShadowColors), 3)
      );
      geometry.setAttribute(
        "vertexSubsurfaceColor",
        new BufferAttribute(new Float32Array(vertexSubsurfaceColors), 3)
      );

      meshRef.current.geometry = geometry;
    }
  }, [growingStage, dyingStage, baseColor, shadowColor, subsurfaceColor]);

  return (
    <mesh {...props} ref={meshRef} castShadow receiveShadow>
      <primitive object={material} ref={materialRef} attach="material" />
    </mesh>
  );
}
