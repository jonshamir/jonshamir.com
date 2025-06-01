import { useEffect, useRef } from "react";

import styles from "./FluidSim.module.scss";
import FluidSimManager from "./modules/FluidSimManager";

let fluidSimManager: FluidSimManager | null = null;

export function FluidSim() {
  // const { isDark } = useColorTheme();
  const isDark = false;
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      fluidSimManager = FluidSimManager.getInstance({
        $wrapper: canvasRef.current
      });
    }
  }, []);

  useEffect(() => {
    fluidSimManager?.setDarkTheme(isDark ? 1 : 0);
  }, [isDark]);

  return <div className={styles.FluidSim} ref={canvasRef}></div>;
}
