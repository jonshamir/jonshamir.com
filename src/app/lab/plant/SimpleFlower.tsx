import { Color, Euler } from "three";

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
  // Scale the flower based on growing stage
  const scale = growingStage * 0.8;

  // Fade out when dying
  const opacity = 1 - dyingStage;

  return (
    <mesh position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <cylinderGeometry args={[0.05, 0.02, 0.15, 8]} />
      <meshStandardMaterial
        color={baseColor}
        transparent
        opacity={opacity}
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
  );
}
