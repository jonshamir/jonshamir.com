import { useTheme } from "next-themes";
import { useMounted } from "nextra/hooks";
import { MoonIcon, SunIcon } from "nextra/icons";
import { useEffect } from "react";

import styles from "./ThemeToggle.module.scss";

import faviconDark from "../../public/favicon-dark.png";
import faviconLight from "../../public/favicon-light.png";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const isDark = resolvedTheme === "dark";

  // @TODO: take system theme
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

  // return (
  //   <div
  //     role="button"
  //     className="ThemeSwitch"
  //     aria-label="Toggle Dark Mode"
  //     tabIndex={0}
  //     onClick={toggleTheme}
  //     onKeyDown={(e) => {
  //       if (e.key === "Enter") toggleTheme();
  //     }}
  //   >
  //     {mounted && isDark ? <MoonIcon /> : <SunIcon />}
  //   </div>
  // );

  return (
    <label htmlFor={styles.ThemeToggle} className={styles.ThemeToggleContainer}>
      <input
        id={styles.ThemeToggle}
        type="checkbox"
        checked={isDark}
        onChange={toggleTheme}
        onKeyDown={(e) => {
          if (e.key === "Enter") toggleTheme();
        }}
        aria-label="Dark mode toggle"
      />
    </label>
  );
}
