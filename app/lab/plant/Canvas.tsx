import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";

import { ThreeCanvas } from "../../../components/ThreeCanvas/ThreeCanvas";
import { Plant } from "./Plant";

export default function PlantCanvas() {
  const { currAge } = useControls({
    currAge: { value: 35, min: 0, max: 200 },
  });

  return (
    <ThreeCanvas camera={{ fov: 15, position: [0, 8, -9] }}>
      <OrbitControls />
      <Plant age={currAge} position={[0, -0.5, 0]} />
    </ThreeCanvas>
  );
}
