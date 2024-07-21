import { RoundedBox } from "@react-three/drei";
import { extend, useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import { ProjectionMappingMaterial } from "./projectionMappingMaterial";
import { group } from "console";

extend({ ProjectionMappingMaterial, RoundedBoxGeometry });

export function ProjectionMapping() {
  const ref = useRef<THREE.Group>(null);
  const [albedo] = useLoader(TextureLoader, ["/textures/EarthAlbedo.jpg"]);
  const [specular] = useLoader(TextureLoader, ["/textures/EarthSpecular.jpg"]);
  const [bump] = useLoader(TextureLoader, ["/textures/EarthHeight.jpg"]);
  const [clouds] = useLoader(TextureLoader, ["/textures/EarthClouds.jpg"]);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001;
    }
  });

  albedo.colorSpace = THREE.SRGBColorSpace;
  return (
    <>
      {/* <RoundedBox
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
      </RoundedBox> */}
      <group ref={ref}>
        <mesh rotation-x={-Math.PI * 0.25} rotation-y={-Math.PI * 0.25}>
          <roundedBoxGeometry args={[2, 2, 2, 6, 0.2]} />
          <projectionMappingMaterial
            albedoMap={albedo}
            specularMap={specular}
            cloudMap={clouds}
          />
        </mesh>
      </group>
      <directionalLight position={[0, 0, 1]} intensity={1.5} />
    </>
  );
}
