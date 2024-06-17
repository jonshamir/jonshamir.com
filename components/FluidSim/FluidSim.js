import { useEffect, useRef } from "react";
import FluidSimManager from "./modules/FluidSimManager";
import style from "./FluidSim.module.scss";
import { useTheme } from "next-themes";

let fluidSimManager = null;

export function FluidSim() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      fluidSimManager = FluidSimManager.getInstance({
        $wrapper: canvasRef.current,
      });
    }
  }, []);

  useEffect(() => {
    fluidSimManager.setDarkTheme(isDark ? 1 : 0);
  }, [isDark]);

  return <div className={style.FluidSim} ref={canvasRef}></div>;
}
