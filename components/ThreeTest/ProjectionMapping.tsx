import { RoundedBox } from "@react-three/drei";
import { extend, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { ProjectionMappingMaterial } from "./projectionMappingMaterial";

extend({ ProjectionMappingMaterial });

export function ProjectionMapping() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [albedo] = useLoader(TextureLoader, ["/textures/EarthAlbedo.jpg"]);
  const [specular] = useLoader(TextureLoader, ["/textures/EarthSpecular.jpg"]);
  const [bump] = useLoader(TextureLoader, ["/textures/EarthHeight.jpg"]);
  const [clouds] = useLoader(TextureLoader, ["/textures/EarthClouds.jpg"]);

  // useFrame(() => {
  //   if (meshRef.current) {
  //     meshRef.current.rotation.y += 0.001;
  //   }
  // });

  albedo.colorSpace = THREE.SRGBColorSpace;
  return (
    <>
      <RoundedBox
        args={[2, 2, 2]}
        radius={0.2}
        rotation-x={-Math.PI * 0.25}
        rotation-y={-Math.PI * 0.25}
        ref={meshRef}
      >
        <projectionMappingMaterial
          albedoMap={albedo}
          specularMap={specular}
          cloudMap={clouds}
        />
      </RoundedBox>
      {/* <mesh ref={meshRef}>
        <torusKnotGeometry args={[0.8, 0.35, 120, 16, 2, 3]} />
        <projectionMappingMaterial
          albedoMap={albedo}
          specularMap={specular}
          cloudMap={clouds}
        />
      </mesh> */}
      <directionalLight position={[0, 0, 1]} intensity={1.5} />
    </>
  );
}
