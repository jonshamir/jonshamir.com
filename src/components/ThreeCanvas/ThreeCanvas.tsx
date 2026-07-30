import { Canvas } from "@react-three/fiber";
import { clsx } from "clsx";

import styles from "./ThreeCanvas.module.css";

/* Backdrop for the WebGL lab canvases — deliberately theme-independent.
   A TS constant rather than a CSS custom property because WebGL can't read CSS:
   the same value has to reach both the wrapper's background and, on canvases
   that clear to it, the r3f `<color attach="background">`. */
export const CANVAS_BG = "#101010";

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
