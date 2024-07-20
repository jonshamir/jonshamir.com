import { Sphere } from "@react-three/drei";
import { extend, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { ProjectionMappingMaterial } from "./projectionMappingMaterial";
import * as THREE from "three";

extend({ ProjectionMappingMaterial });

export function ProjectionMapping() {
  const [albedo] = useLoader(TextureLoader, ["/textures/EarthAlbedo.jpg"]);
  const [specular] = useLoader(TextureLoader, ["/textures/EarthSpecular.jpg"]);
  const [bump] = useLoader(TextureLoader, ["/textures/EarthHeight.jpg"]);
  const [clouds] = useLoader(TextureLoader, ["/textures/EarthClouds.jpg"]);

  albedo.colorSpace = THREE.SRGBColorSpace;
  return (
    <>
      <Sphere args={[1, 32, 32]}>
        <projectionMappingMaterial
          albedoMap={albedo}
          specularMap={specular}
          cloudMap={clouds}
        />
      </Sphere>
      <directionalLight position={[0, 0, 1]} intensity={1.5} />
    </>
  );
}
