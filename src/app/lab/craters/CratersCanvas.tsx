import { OrbitControls } from "@react-three/drei";

import {
  CANVAS_BG,
  ThreeCanvas
} from "../../../components/ThreeCanvas/ThreeCanvas";
import { MoonCraters } from "./MoonCraters";

export default function CratersCanvas() {
  return (
    <ThreeCanvas
      camera={{ position: [0, 0, 10], zoom: 6 }}
      style={{ backgroundColor: CANVAS_BG }}
    >
      <OrbitControls enablePan={false} enableZoom={false} />
      <MoonCraters />
    </ThreeCanvas>
  );
}
