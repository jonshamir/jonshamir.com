import { Canvas } from "@react-three/fiber";
import styles from "./ThreeCanvas.module.scss";

export function ThreeCanvas({
  children,
  ...rest
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.ThreeCanvas}`}>
      <Canvas {...rest}>{children}</Canvas>
    </div>
  );
}
