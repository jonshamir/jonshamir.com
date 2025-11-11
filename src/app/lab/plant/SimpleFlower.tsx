import { useEffect, useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Color, Euler, Mesh } from "three";

import { getFlowerVertices } from "./utils";

interface SimpleFlowerProps {
  growingStage: number;
  dyingStage: number;
  position?: [number, number, number];
  rotation?: Euler;
  baseColor?: Color;
  shadowColor?: Color;
  subsurfaceColor?: Color;
}

export function SimpleFlower({
  growingStage,
  dyingStage,
  position = [0, 0, 0],
  rotation,
  baseColor = new Color("#ff69b4")
}: SimpleFlowerProps) {
  const meshRef = useRef<Mesh>(null);

  // Create geometry once
  const geometry = useMemo(() => new BufferGeometry(), []);

  // Update geometry when growingStage changes
  useEffect(() => {
    const height = 0.15;
    const baseRadius = 0.005;
    const tipRadius = 0.02;
    const segments = 2;

    const { vertices, indices, localX, localY, localZ } = getFlowerVertices(
      height,
      baseRadius,
      tipRadius,
      segments
    );

    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // Add custom attributes for potential shader use
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
  }, [geometry, growingStage]);

  // Scale the flower based on growing stage
  const scale = growingStage * 0.8;

  // Fade out when dying

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
      geometry={geometry}
    >
      <meshStandardMaterial
        color={baseColor}
        transparent
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
  );
}
