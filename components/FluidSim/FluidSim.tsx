import { useEffect, useRef } from "react";
import FluidSimManager from "./modules/FluidSimManager";
import styles from "./FluidSim.module.scss";
import { useColorTheme } from "../ThemeToggle/useColorTheme";

let fluidSimManager: FluidSimManager | null = null;

export function FluidSim() {
  const { isDark } = useColorTheme();
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      fluidSimManager = FluidSimManager.getInstance({
        $wrapper: canvasRef.current,
      });
    }
  }, []);

  useEffect(() => {
    fluidSimManager?.setDarkTheme(isDark ? 1 : 0);
  }, [isDark]);

  return <div className={styles.FluidSim} ref={canvasRef}></div>;
}
