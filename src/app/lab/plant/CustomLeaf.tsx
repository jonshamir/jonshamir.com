import { useEffect, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Euler,
  Mesh,
  QuadraticBezierCurve3,
  Vector3
} from "three";

import { getLeafVertices } from "./utils";

const { pow } = Math;

interface LeafProps {
  position?: [number, number, number];
  growingStage: number; // 0 = new, 1 = fully grown
  dyingStage: number; // 0 = not dying, 1 = dead
  rotation?: Euler;
}

const curveSamples = 12;

export function CustomLeaf({ growingStage, dyingStage, ...props }: LeafProps) {
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    const length = 1 - 0.1 * pow(growingStage, 1);
    const curve = new QuadraticBezierCurve3(
      new Vector3(0, 0, 0), // Start point
      new Vector3(0, 0.5 * Math.pow(growingStage, 10), 0.7 * length), // Control point
      new Vector3(0, 0, length) // End point
    );
    const { vertices, indices } = getLeafVertices(
      curveSamples,
      curve,
      growingStage
    );

    if (meshRef.current) {
      const geometry = new BufferGeometry();
      geometry.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(vertices), 3)
      );
      geometry.setIndex(indices);
      geometry.computeVertexNormals(); // Compute smooth normals
      meshRef.current.geometry = geometry;
    }
  }, [growingStage, dyingStage]);

  return (
    <mesh {...props} ref={meshRef}>
      <meshNormalMaterial flatShading={false} />
    </mesh>
  );
}
