import { useEffect, useState } from "react";

type ColorMode = "dark" | "light";

export function useColorMode() {
  const [colorMode, rawSetColorMode] = useState<ColorMode>();

  useEffect(() => {
    const root = window.document.documentElement;
    const initialColorValue = root.classList.contains("dark")
      ? "dark"
      : "light";
    rawSetColorMode(initialColorValue);
  }, []);

  const setColorMode = (value: ColorMode) => {
    rawSetColorMode(value);
    window.localStorage.setItem("color-mode", value);
    const root = window.document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(value);
  };

  const toggleColorMode = () => {
    setColorMode(colorMode === "dark" ? "light" : "dark");
  };

  // update favicon
  useEffect(() => {
    const favicon = document.querySelector(
      'link[rel="icon"]'
    ) as HTMLLinkElement;
    if (favicon === null) return;
    if (colorMode === "dark") {
      favicon.href = "/favicon-dark.png";
    } else {
      favicon.href = "/favicon-light.png";
    }
  }, [colorMode]);

  return {
    colorMode,
    setColorMode,
    toggleColorMode
  };
}
