import { useEffect, useMemo, useState } from "react";
import { useLocalStorage, useMediaQuery } from "usehooks-ts";

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

  // update favicon
  useEffect(() => {
    const favicon = document.querySelector(
      'link[rel="icon"]'
    ) as HTMLLinkElement;
    if (favicon === null) return;
    if (colorScheme === "dark") {
      favicon.href = faviconDark.src;
    } else {
      favicon.href = faviconLight.src;
    }
  }, [colorScheme]);

  return {
    colorScheme,
    setColorScheme
  };
}
