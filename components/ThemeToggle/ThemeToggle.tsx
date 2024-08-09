import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import styles from "./ThemeToggle.module.scss";

import faviconDark from "../../public/favicon-dark.png";
import faviconLight from "../../public/favicon-light.png";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // @TODO: take system theme
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 1000);
  }, []);

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
    <label
      htmlFor={styles.ThemeToggle}
      className={`${styles.ThemeToggleContainer} ${
        isLoaded ? styles.loaded : ""
      }`}
    >
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
