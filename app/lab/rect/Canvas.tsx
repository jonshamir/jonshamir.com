import { OrbitControls, Stats } from "@react-three/drei";
import chroma from "chroma-js";
import { useControls } from "leva";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { BlurredRect } from "./BlurredRect";
import { Rect } from "./Rect";

export default function RectCanvas() {
  const controls = useControls({
    color: { value: "#aab6d1", label: "Color" },
    radius: { value: 1, min: 0, max: 1, label: "Radius" },
    size: {
      value: { x: 1, y: 1 },
      x: { min: 0 },
      y: { min: 0 },
      label: "Size"
    },
    zOffset: { value: 0.3, min: 0, max: 10, label: "Z Offset" }
  });

  const chromaColor = chroma(controls.color);

  const rectDataGrid = Array.from({ length: 12 }, (_, i) => {
    return Array.from({ length: 6 }, (_, j) => {
      const offset = Math.max(
        Math.sin(i + j + controls.zOffset) * 0.5 + 0.1,
        0
      );
      return {
        offset,
        size: controls.size,
        radius: controls.radius,
        pos: { x: i * 1.4 - 8, y: 3.5 - j * 1.4, z: 0 }
      };
    });
  });

  return (
    <ThreeCanvas
      camera={{ position: [0, 0, 10], zoom: 3.5 }}
      isFullscreen={true}
      gl={{ sortObjects: false }}
    >
      <Stats />
      <OrbitControls enablePan={false} />
      <Rect
        size={{ x: 20, y: 10 }}
        color={chromaColor.hex()}
        radius={1}
        position={[0, 0, -0.01]}
      />

      {/* Shadows */}
      {rectDataGrid.map((rectDataRow, i) =>
        rectDataRow.map((rectData, j) => {
          const { offset, size, radius, pos } = rectData;
          return (
            <BlurredRect
              key={`${i}-${j}`}
              size={size}
              color={chromaColor.darken(offset * 0.5 + 0.4).hex()}
              radius={radius}
              position={[pos.x, pos.y, pos.z]}
              blur={offset * 1.5}
            />
          );
        })
      )}

      {/* Rects */}
      {rectDataGrid.map((rectDataRow, i) =>
        rectDataRow.map((rectData, j) => {
          const { offset, size, radius, pos } = rectData;
          return (
            <Rect
              key={`${i}-${j}`}
              size={size}
              color={chromaColor.brighten(offset * 0.5).hex()}
              radius={radius}
              position={[pos.x, pos.y, pos.z + offset]}
            />
          );
        })
      )}
    </ThreeCanvas>
  );
}
