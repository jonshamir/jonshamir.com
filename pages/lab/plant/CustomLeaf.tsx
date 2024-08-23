import { useEffect, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Euler,
  Mesh,
  QuadraticBezierCurve3,
  Vector3,
} from "three";
import { getLeafVertices } from "./utils";

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
    const length = 1 * growingStage * (1 - dyingStage);
    const curve = new QuadraticBezierCurve3(
      new Vector3(0, 0, 0), // Start point
      new Vector3(0, -0.3 * Math.pow(growingStage, 10), 0.5 * length), // Control point
      new Vector3(0, 0, length) // End point
    );
    const p = new Float32Array(
      getLeafVertices(curveSamples, curve, growingStage)
    );
    if (meshRef.current) {
      meshRef.current.geometry = new BufferGeometry();
      meshRef.current.geometry.setAttribute(
        "position",
        new BufferAttribute(p, 3)
      );
    }
  }, [growingStage, dyingStage]);

  return (
    <mesh {...props} ref={meshRef}>
      <meshNormalMaterial flatShading={true} />
    </mesh>
  );
}
