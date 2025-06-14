import { ReactThreeFiber, ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

interface MoonMaterialProps {
  albedoMap?: THREE.Texture;
  bumpMap?: THREE.Texture;
}

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {
        moonMaterial: ReactThreeFiber.Object3DNode<
          MoonMaterialProps,
          MoonMaterialProps
        >;
      }
    }
  }
}
