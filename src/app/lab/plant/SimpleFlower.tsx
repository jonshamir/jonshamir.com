import { useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Euler,
  Mesh
} from "three";

import { PlantMaterial } from "./plantMaterial";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dyingStage,
  position = [0, 0, 0],
  rotation,
  baseColor = new Color("#ff69b4"),
  shadowColor = new Color("#801a4d"),
  subsurfaceColor = new Color("#ffb3e6")
}: SimpleFlowerProps) {
  const meshRef = useRef<Mesh>(null);

  // Create geometry and material once
  const geometry = useMemo(() => new BufferGeometry(), []);
  const material = useMemo(() => {
    const mat = new PlantMaterial();
    mat.side = DoubleSide;
    return mat;
  }, []);

  // Update geometry when growingStage or colors change
  useEffect(() => {
    const height = 0.15;
    const baseRadius = 0.005;
    const tipRadius = 0.015;
    const segments = 2;

    const {
      vertices,
      indices,
      localX,
      localY,
      localZ,
      vertexBaseColors,
      vertexShadowColors,
      vertexSubsurfaceColors
    } = getFlowerVertices(
      height,
      baseRadius,
      tipRadius,
      segments,
      [baseColor.r, baseColor.g, baseColor.b],
      [shadowColor.r, shadowColor.g, shadowColor.b],
      [subsurfaceColor.r, subsurfaceColor.g, subsurfaceColor.b]
    );

    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();

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
  }, [geometry, growingStage, baseColor, shadowColor, subsurfaceColor]);

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
      material={material}
      castShadow
      receiveShadow
    />
  );
}
