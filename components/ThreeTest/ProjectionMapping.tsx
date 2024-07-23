import { RoundedBox } from "@react-three/drei";
import { extend, useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { TextureLoader } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import { ProjectionMappingMaterial } from "./projectionMappingMaterial";
import { group } from "console";

extend({ ProjectionMappingMaterial, RoundedBoxGeometry });

function Model({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url);
  const ref = useRef<THREE.Mesh>(null!);

  return <primitive object={obj} ref={ref} />;
}

export enum BaseMesh {
  Sphere = "sphere",
  Cube = "cube",
  Dodecahedron = "dodecahedron",
  Octahedron = "octahedron",
  Icosahedron = "icosahedron",
  Torus = "torus",
}

export function ProjectionMapping({
  baseMesh = BaseMesh.Cube,
}: {
  baseMesh?: BaseMesh;
}) {
  const ref = useRef<THREE.Group>(null);
  const [albedo] = useLoader(TextureLoader, ["/textures/EarthAlbedo.jpg"]);
  const [specular] = useLoader(TextureLoader, ["/textures/EarthSpecular.jpg"]);
  const [bump] = useLoader(TextureLoader, ["/textures/EarthHeight.jpg"]);
  const [clouds] = useLoader(TextureLoader, ["/textures/EarthClouds.jpg"]);

  const obj = useLoader(OBJLoader, `/models/${baseMesh}.obj`);

  // Assuming the first child of the loaded object is the mesh we want
  const geometry = obj.children[0].geometry as THREE.BufferGeometry;

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001;
    }
  });

  albedo.colorSpace = THREE.SRGBColorSpace;
  return (
    <>
      <group ref={ref}>
        <mesh geometry={geometry}>
          {/* <roundedBoxGeometry args={[2, 2, 2, 6, 0.2]} /> */}
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
