import clsx from "clsx";
import { useEffect, useState } from "react";

import faviconDark from "../../public/favicon-dark.png";
import faviconLight from "../../public/favicon-light.png";
import styles from "./ThemeToggle.module.scss";
import { useColorTheme } from "./useColorTheme";

export function ThemeToggle() {
  const { isDark, setIsDark } = useColorTheme();

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  useEffect(() => {
    const favicon = document.querySelector(
      'link[rel="icon"]'
    ) as HTMLLinkElement;
    if (favicon === null) return;
    console.log(document.body.classList);
    if (isDark) {
      document.body.classList.add("dark");
      favicon.href = faviconDark.src;
    } else {
      document.body.classList.remove("dark");
      favicon.href = faviconLight.src;
    }
  }, [isDark]);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 1000);
  }, []);

  return (
    <label
      htmlFor={styles.ThemeToggle}
      className={clsx("clickable", styles.ThemeToggleContainer, {
        [styles.loaded]: isLoaded
      })}
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
