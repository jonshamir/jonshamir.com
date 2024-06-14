import React, { useEffect, useRef, useState } from "react";
import { useColorTheme } from "../DarkModeToggle/useColorTheme";
import WebGL from "./modules/WebGL";
import "./FluidSim.scss";

let container, webglMng;

export const FluidSim = () => {
  const { isDark } = useColorTheme();
  const canvasRef = useRef();

  const [didInit, setDidInit] = useState(false);

  useEffect(() => {
    if (!didInit) {
      initScene();
      setDidInit(true);
    }
  }, [didInit, initScene]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function initScene() {
    container = canvasRef.current;
    webglMng = new WebGL({
      $wrapper: container,
    });
  }

  useEffect(() => {
    webglMng.setDarkTheme(isDark ? 1 : 0);
  }, [isDark]);

  return <div className="FluidSim" ref={canvasRef}></div>;
};

export default FluidSim;
