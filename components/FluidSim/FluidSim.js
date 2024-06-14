import { useEffect, useRef } from "react";
// import { useColorTheme } from "../DarkModeToggle/useColorTheme";
import WebGL from "./modules/WebGL";
import style from "./FluidSim.module.scss";

let webglManager = null;

export function FluidSim() {
  // const { isDark } = useColorTheme();
  const { isDark } = false;
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && webglManager === null) {
      console.log("canvasRef.currenst", canvasRef.current);
      webglManager = new WebGL({
        $wrapper: canvasRef.current,
      });
    }
    console.log("webglManager", webglManager);
  }, []);

  useEffect(() => {
    webglManager.setDarkTheme(isDark ? 1 : 0);
  }, [isDark]);

  return <div className={style.FluidSim} ref={canvasRef}></div>;
}
