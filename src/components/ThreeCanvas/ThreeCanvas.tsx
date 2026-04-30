import { Canvas } from "@react-three/fiber";
import { clsx } from "clsx";

import styles from "./ThreeCanvas.module.scss";

export type ThreeCanvasProps = React.ComponentProps<typeof Canvas> & {
  isFullscreen?: boolean;
  grabCursor?: boolean;
};

export function ThreeCanvas({
  children,
  className,
  isFullscreen = false,
  grabCursor = true,
  ...rest
}: ThreeCanvasProps) {
  return (
    <div
      className={clsx(styles.ThreeCanvas, className, {
        // Global (non-hashed) class — see src/styles/three-canvas.css.
        // Avoids CSS-module hash desync during Fast Refresh.
        "three-canvas-fullscreen": isFullscreen,
        [styles.grabCursor]: grabCursor
      })}
    >
      <Canvas {...rest}>{children}</Canvas>
    </div>
  );
}
