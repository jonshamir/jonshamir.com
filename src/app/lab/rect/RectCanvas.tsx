import { OrbitControls } from "@react-three/drei";
import { Leva, useControls } from "leva";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { BlurredRect } from "./BlurredRect";
import { Rect } from "./Rect";

function ShadowRect(props: {
  size: { x: number; y: number };
  color: string;
  radius: number;
  offset: number;
}) {
  const { size, color, radius, offset } = props;
  return (
    <>
      <BlurredRect
        size={size}
        color="#444"
        radius={radius}
        blur={offset}
        // position={[0, 0, -offset]}
      />
      <Rect
        size={size}
        color={color}
        radius={radius}
        position={[0, 0, offset]}
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
    blur: { value: 0.3, min: 0, max: 1, label: "Blur" }
  });

  return (
    <>
      <Leva />
      <ThreeCanvas
        camera={{ position: [0, 0, 10], zoom: 3.5 }}
        isFullscreen={true}
      >
        <OrbitControls enablePan={false} />
        <ShadowRect
          size={controls.size}
          color={controls.color}
          radius={controls.radius}
          offset={controls.blur}
        />
        <Rect
          size={{ x: 10, y: 5 }}
          color="#999"
          radius={1}
          position={[0, 0, -0.01]}
        />
      </ThreeCanvas>
    </>
  );
}
