import { Sphere } from "@react-three/drei";
import { extend, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { ProjectionMappingMaterial } from "./projectionMappingMaterial";

extend({ ProjectionMappingMaterial });

export function ProjectionMapping() {
  const [albedo] = useLoader(TextureLoader, ["/textures/EarthAlbedo.jpg"]);

  return (
    <>
      <Sphere args={[1, 32, 32]}>
        <projectionMappingMaterial albedoMap={albedo} />
      </Sphere>
      <directionalLight position={[0, 0, 1]} intensity={1.5} />
    </>
  );
}
