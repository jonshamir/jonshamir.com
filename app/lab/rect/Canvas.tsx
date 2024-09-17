import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { Rect } from "./Rect";

export default function RectCanvas() {
  const controls = useControls({
    color: { value: "#5772ad", label: "Color" },
    radius: { value: 0.3, min: 0, max: 1, label: "Radius" },
    size: {
      value: { x: 1, y: 1 },
      x: { min: 0 },
      y: { min: 0 },
      label: "Size"
    }
  });

  return (
    <ThreeCanvas camera={{ position: [0, 0, 10], zoom: 3.5 }}>
      <OrbitControls enablePan={false} />
      <Rect
        size={controls.size}
        color={controls.color}
        radius={controls.radius}
      />
      <Rect
        size={{ x: 10, y: 5 }}
        color="#999"
        radius={controls.radius}
        position={[0, 0, -1]}
      />
    </ThreeCanvas>
  );
}
