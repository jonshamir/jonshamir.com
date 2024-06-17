import { useEffect, useRef } from "react";
// import { useColorTheme } from "../DarkModeToggle/useColorTheme";
import FluidSimManager from "./modules/FluidSimManager";
import style from "./FluidSim.module.scss";

let fluidSimManager = null;

export function FluidSim() {
  // const { isDark } = useColorTheme();
  const { isDark } = false;
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
