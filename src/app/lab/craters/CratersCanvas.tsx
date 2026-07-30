import { OrbitControls } from "@react-three/drei";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { MoonCraters } from "./MoonCraters";

export default function CratersCanvas() {
  return (
    <ThreeCanvas
      camera={{ position: [0, 0, 10], zoom: 6 }}
      style={{ backgroundColor: "var(--color-canvas-bg)" }}
    >
      <OrbitControls enablePan={false} enableZoom={false} />
      <MoonCraters />
    </ThreeCanvas>
  );
}
