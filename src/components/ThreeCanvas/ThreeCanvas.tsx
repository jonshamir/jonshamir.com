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
  // Inline fullscreen positioning so HMR can't desync the CSS-module class hash and drop position:fixed.
  const wrapperStyle: React.CSSProperties | undefined = isFullscreen
    ? {
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 10,
        borderRadius: 0
      }
    : undefined;

  return (
    <div
      className={clsx(styles.ThreeCanvas, className, {
        [styles.fullscreen]: isFullscreen,
        [styles.grabCursor]: grabCursor
      })}
      style={wrapperStyle}
    >
      <Canvas {...rest}>{children}</Canvas>
    </div>
  );
}
