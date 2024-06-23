import { useTheme } from "next-themes";
import { useMounted } from "nextra/hooks";
import { MoonIcon, SunIcon } from "nextra/icons";
import { useEffect } from "react";

import faviconDark from "../public/favicon-dark.png";
import faviconLight from "../public/favicon-light.png";

export default function ThemeSwitch() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const isDark = resolvedTheme === "dark";

  // @TODO: system theme
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  useEffect(() => {
    const favicon = document.querySelector(
      'link[rel="icon"]'
    ) as HTMLLinkElement;
    if (favicon === null) return;
    if (isDark) {
      document.body.classList.add("dark");
      favicon.href = faviconDark.src;
    } else {
      document.body.classList.remove("dark");
      favicon.href = faviconLight.src;
    }
  }, [isDark]);

  return (
    <span
      role="button"
      aria-label="Toggle Dark Mode"
      tabIndex={0}
      onClick={toggleTheme}
      onKeyDown={(e) => {
        if (e.key === "Enter") toggleTheme();
      }}
    >
      {mounted && isDark ? <MoonIcon /> : <SunIcon />}
    </span>
  );
}
