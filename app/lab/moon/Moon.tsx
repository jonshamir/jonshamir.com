import { StatsGl } from "@react-three/drei";
import { extend, useFrame, useLoader } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";

import { MoonMaterial } from "./moonMaterial";

extend({ MoonMaterial, RoundedBoxGeometry });

export function Moon() {
  const ref = useRef<THREE.Group>(null);
  const [albedo] = useLoader(TextureLoader, ["/textures/MoonAlbedo.png"]);
  const [bump] = useLoader(TextureLoader, ["/textures/MoonHeight.png"]);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(2, 12), []);

  useFrame(() => {
    if (ref.current) {
      // ref.current.rotation.y += 0.001;
    }
  });

  albedo.colorSpace = THREE.SRGBColorSpace;
  return (
    <>
      <group ref={ref}>
        <StatsGl />
        <mesh geometry={geometry}>
          <moonMaterial albedoMap={albedo} bumpMap={bump} />
        </mesh>
      </group>
    </>
  );
}
