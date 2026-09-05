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
    if (colorMode === undefined) return;
    const href =
      colorMode === "dark" ? "/favicon-dark.png" : "/favicon-light.png";
    document
      .querySelectorAll<HTMLLinkElement>('link[rel="icon"]')
      .forEach((favicon) => {
        // strip media so the browser's own scheme matching stops competing
        favicon.removeAttribute("media");
        favicon.href = href;
      });
  }, [colorMode]);

  return {
    colorMode,
    setColorMode,
    toggleColorMode
  };
}
