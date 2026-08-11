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
import { getFlowerVertices, lerp, saturate } from "./utils";

interface SimpleFlowerProps {
  growingStage: number;
  dyingStage: number;
  minScale?: number;
  minThickness?: number;
  colorMixPower?: number;
  openStage?: number;
  position?: [number, number, number];
  rotation?: Euler;
  baseColor?: Color;
  shadowColor?: Color;
  subsurfaceColor?: Color;
  stemColor?: Color;
  stemShadowColor?: Color;
  stemSubsurfaceColor?: Color;
}

export function SimpleFlower({
  growingStage,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dyingStage,
  minScale = 0,
  minThickness = 1,
  colorMixPower = 1,
  openStage = 0.5,
  position = [0, 0, 0],
  rotation,
  baseColor = new Color("#ff69b4"),
  shadowColor = new Color("#801a4d"),
  subsurfaceColor = new Color("#ffb3e6"),
  stemColor,
  stemShadowColor,
  stemSubsurfaceColor
}: SimpleFlowerProps) {
  const meshRef = useRef<Mesh>(null);

  // Create geometry and material once
  const geometry = useMemo(() => new BufferGeometry(), []);
  const material = useMemo(() => {
    const mat = new PlantMaterial();
    mat.side = DoubleSide;
    return mat;
  }, []);

  // Petals snap open once growth passes the threshold; the geometry
  // rebuild fires only when the boolean flips
  const open = growingStage >= openStage;

  // Update geometry when open state or colors change
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
      vertexSubsurfaceColors,
      petalNormals
    } = getFlowerVertices(
      height,
      baseRadius,
      tipRadius,
      segments,
      [baseColor.r, baseColor.g, baseColor.b],
      [shadowColor.r, shadowColor.g, shadowColor.b],
      [subsurfaceColor.r, subsurfaceColor.g, subsurfaceColor.b],
      open
    );

    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    if (petalNormals) {
      const normals = geometry.getAttribute("normal");
      const petalStart = normals.count - petalNormals.length / 3;
      for (let i = 0; i < petalNormals.length / 3; i++) {
        normals.setXYZ(
          petalStart + i,
          petalNormals[i * 3],
          petalNormals[i * 3 + 1],
          petalNormals[i * 3 + 2]
        );
      }
      normals.needsUpdate = true;
    }
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
  }, [geometry, baseColor, shadowColor, subsurfaceColor, open]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Young flowers blend toward the stem palette, recoloring as they grow
  const colorMix = stemColor
    ? Math.pow(saturate(growingStage), colorMixPower)
    : 1;
  useEffect(() => {
    material.colorMix = colorMix;
    if (stemColor) material.stemColor = stemColor;
    if (stemShadowColor) material.stemShadowColor = stemShadowColor;
    if (stemSubsurfaceColor) material.stemSubsurfaceColor = stemSubsurfaceColor;
  }, [material, colorMix, stemColor, stemShadowColor, stemSubsurfaceColor]);

  // Growth mostly elongates the flower; thickness stays near constant
  const length = lerp(minScale, 1, growingStage) * 0.8;
  const thickness = lerp(minThickness, 1, growingStage) * 0.8;

  // Fade out when dying

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={[thickness, length, thickness]}
      geometry={geometry}
      material={material}
      castShadow
      receiveShadow
    />
  );
}
