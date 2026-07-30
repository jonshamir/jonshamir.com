import { ReactThreeFiber, ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

interface MoonMaterialProps {
  albedoMap?: THREE.Texture;
  bumpMap?: THREE.Texture;
}

/* Allow CSS custom properties in `style` props. Without this every call site
   needs an `as React.CSSProperties` cast to set a `--var`. */
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
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
