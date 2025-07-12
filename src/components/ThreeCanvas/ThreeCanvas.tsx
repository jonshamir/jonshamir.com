import { Canvas } from "@react-three/fiber";
import { clsx } from "clsx";

import styles from "./ThreeCanvas.module.scss";

export type ThreeCanvasProps = React.ComponentProps<typeof Canvas> & {
  isFullscreen?: boolean;
};

export function ThreeCanvas({
  children,
  className,
  isFullscreen = false,
  ...rest
}: ThreeCanvasProps) {
  return (
    <div
      className={clsx(styles.ThreeCanvas, className, {
        [styles.fullscreen]: isFullscreen
      })}
    >
      <Canvas {...rest}>{children}</Canvas>
    </div>
  );
}
