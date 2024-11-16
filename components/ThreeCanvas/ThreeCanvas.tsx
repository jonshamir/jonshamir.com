import { Canvas } from "@react-three/fiber";
import clsx from "clsx";

import styles from "./ThreeCanvas.module.scss";

export type ThreeCanvasProps = React.ComponentProps<typeof Canvas>;

export function ThreeCanvas({
  children,
  className,
  ...rest
}: ThreeCanvasProps) {
  return (
    <div className={clsx(styles.ThreeCanvas, className)}>
      <Canvas {...rest}>{children}</Canvas>
    </div>
  );
}
