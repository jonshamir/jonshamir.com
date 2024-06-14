import { useEffect, useRef, useState } from "react";
// import { useColorTheme } from "../DarkModeToggle/useColorTheme";
import WebGL from "./modules/WebGL";
import style from "./FluidSim.module.scss";

let container, webglMng;

export function FluidSim() {
  // const { isDark } = useColorTheme();
  const { isDark } = false;
  const canvasRef = useRef();

  const [didInit, setDidInit] = useState(false);

  useEffect(() => {
    if (!didInit) {
      initScene();
      setDidInit(true);
    }
  }, [didInit, initScene]);

  function initScene() {
    container = canvasRef.current;
    webglMng = new WebGL({
      $wrapper: container,
    });
  }

  useEffect(() => {
    webglMng.setDarkTheme(isDark ? 1 : 0);
  }, [isDark]);

  return <div className={style.FluidSim} ref={canvasRef}></div>;
}
