import { ReactThreeFiber, ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

interface MoonMaterialProps {
  albedoMap?: THREE.Texture;
  bumpMap?: THREE.Texture;
}

interface LeafMaterialProps {
  age?: number;
  baseColor?: THREE.Color;
  tipColor?: THREE.Color;
  topColor?: THREE.Color;
  bottomColor?: THREE.Color;
}

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {
        moonMaterial: ReactThreeFiber.Object3DNode<
          MoonMaterialProps,
          MoonMaterialProps
        >;
        leafMaterial: ReactThreeFiber.Object3DNode<
          LeafMaterialProps,
          LeafMaterialProps
        >;
      }
    }
  }
}
