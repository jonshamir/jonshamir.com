import { useEffect, useState } from "react";

import faviconDark from "../../../public/favicon-dark.png";
import faviconLight from "../../../public/favicon-light.png";

type ColorScheme = "dark" | "light";

export function useColorScheme() {
  const [colorScheme, rawSetColorScheme] = useState<ColorScheme>();

  useEffect(() => {
    const root = window.document.documentElement;
    const initialColorValue = root.classList.contains("dark")
      ? "dark"
      : "light";
    rawSetColorScheme(initialColorValue);
  }, []);

  const setColorScheme = (value: ColorScheme) => {
    rawSetColorScheme(value);
    window.localStorage.setItem("color-scheme", value);
    const root = window.document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(value);
  };

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  // update favicon
  useEffect(() => {
    const favicon = document.querySelector(
      'link[rel="icon"]'
    ) as HTMLLinkElement;
    if (favicon === null) return;
    if (colorScheme === "dark") {
      favicon.href = String(faviconDark.src);
    } else {
      favicon.href = String(faviconLight.src);
    }
  }, [colorScheme]);

  return {
    colorScheme,
    setColorScheme,
    toggleColorScheme
  };
}
