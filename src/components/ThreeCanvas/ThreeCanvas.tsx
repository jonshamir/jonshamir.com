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
        [styles.fullscreen]: isFullscreen,
        [styles.grabCursor]: grabCursor
      })}
    >
      <Canvas {...rest}>{children}</Canvas>
    </div>
  );
}
