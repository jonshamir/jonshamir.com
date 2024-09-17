import { Canvas } from "@react-three/fiber";

import styles from "./ThreeCanvas.module.scss";

export type ThreeCanvasProps = React.ComponentProps<typeof Canvas>;

export function ThreeCanvas({ children, ...rest }: ThreeCanvasProps) {
  return (
    <div className={styles.ThreeCanvas}>
      <Canvas {...rest}>{children}</Canvas>
    </div>
  );
}
