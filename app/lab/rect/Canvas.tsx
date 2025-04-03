import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { BlurredRect } from "./BlurredRect";
import { Rect } from "./Rect";

function ShadowRect(props: {
  size: { x: number; y: number };
  color: string;
  radius: number;
  offset: number;
  position: number[];
}) {
  const { size, color, radius, offset, position } = props;
  const [x, y, z] = position;
  return (
    <>
      <BlurredRect
        size={size}
        color={`hsl(0, 0%, ${30 + offset * 10}%)`}
        radius={radius}
        blur={offset * 1.8}
        position={[x, y - offset / 2, z]}
      />
      <Rect
        size={size}
        color={color}
        radius={radius}
        position={[x, y, z + offset]}
      />
    </>
  );
}

export default function RectCanvas() {
  const controls = useControls({
    color: { value: "#5772ad", label: "Color" },
    radius: { value: 1, min: 0, max: 1, label: "Radius" },
    size: {
      value: { x: 1, y: 1 },
      x: { min: 0 },
      y: { min: 0 },
      label: "Size"
    },
    zOffset: { value: 0.3, min: 0, max: 10, label: "Z Offset" }
  });

  return (
    <ThreeCanvas
      camera={{ position: [0, 0, 10], zoom: 3.5 }}
      isFullscreen={true}
      gl={{ sortObjects: false }}
    >
      <OrbitControls enablePan={false} />
      <Rect
        size={{ x: 20, y: 10 }}
        color="hsl(0, 0%, 50%)"
        radius={1}
        position={[0, 0, -0.01]}
      />

      {Array.from({ length: 12 }, (_, i) => {
        return Array.from({ length: 6 }, (_, j) => {
          const offset = Math.max(
            Math.sin(i + j + controls.zOffset) * 0.5 + 0.1,
            0
          );
          return (
            <ShadowRect
              key={`${i}-${j}`}
              size={controls.size}
              color={`hsl(0, 0%, ${50 + offset * 3}%)`}
              radius={controls.radius}
              offset={offset}
              position={[i * 1.4 - 8, 3.5 - j * 1.4, 0]}
            />
          );
        });
      })}
    </ThreeCanvas>
  );
}
