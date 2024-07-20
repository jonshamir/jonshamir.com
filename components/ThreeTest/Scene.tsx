import { OrbitControls } from "@react-three/drei";

import { MoonCraters } from "./MoonCraters";
import { ProjectionMapping } from "./ProjectionMapping";

export function Scene() {
  return (
    <>
      <OrbitControls
        position={[0, 0, 0]}
        enablePan={false}
        enableZoom={false}
      />
      <ProjectionMapping />
    </>
  );
}
