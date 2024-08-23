import { OrbitControls } from "@react-three/drei";
import { MoonCraters } from "./MoonCraters";
import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";

export function CratersCanvas() {
  return (
    <ThreeCanvas camera={{ position: [0, 0, 10], zoom: 6 }}>
      <OrbitControls enablePan={false} enableZoom={false} />
      <MoonCraters />
    </ThreeCanvas>
  );
}
