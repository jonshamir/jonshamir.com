import { useEffect, useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Color, Mesh } from "three";

import { PotMaterial } from "./potMaterial";
import { getPotVertices } from "./utils";

interface PotProps {
  position?: [number, number, number];
  baseColor?: Color;
  shadowColor?: Color;
  height?: number;
  bottomRadius?: number;
  topRadius?: number;
  rimHeight?: number;
  rimThickness?: number;
  potThickness?: number;
}

export function Pot({
  position = [0, 0, 0],
  baseColor = new Color(0.8, 0.5, 0.3),
  shadowColor = new Color(0.3, 0.2, 0.1),
  height = 1.0,
  bottomRadius = 0.3,
  topRadius = 0.5,
  rimHeight = 0.1,
  rimThickness = 0.05,
  potThickness = 0.03
}: PotProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<PotMaterial>(null);

  // Create material once
  const material = useMemo(() => new PotMaterial(), []);

  // Update material colors
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.baseColor = baseColor;
      materialRef.current.shadowColor = shadowColor;
    }
  }, [baseColor, shadowColor]);

  // Update pot geometry
  useEffect(() => {
    const { vertices, indices, localX, localY, localZ } = getPotVertices(
      height,
      bottomRadius,
      topRadius,
      rimHeight,
      rimThickness,
      potThickness,
      10 // segments
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

      meshRef.current.geometry = geometry;
    }
  }, [
    height,
    bottomRadius,
    topRadius,
    rimHeight,
    rimThickness,
    potThickness,
    baseColor,
    shadowColor
  ]);

  // Calculate adjusted position so the top of the pot is at the given position
  const adjustedPosition: [number, number, number] = [
    position[0],
    position[1] - height,
    position[2]
  ];

  return (
    <mesh ref={meshRef} position={adjustedPosition} castShadow receiveShadow>
      <primitive object={material} ref={materialRef} attach="material" />
    </mesh>
  );
}
