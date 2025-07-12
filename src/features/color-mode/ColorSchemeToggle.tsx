import { clsx } from "clsx";
import { useEffect, useState } from "react";

import styles from "./ColorSchemeToggle.module.scss";
import { useColorScheme } from "./useColorScheme";

export function ColorSchemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 500);
  }, []);

  return (
    <label
      htmlFor={styles.ColorSchemeToggle}
      className={clsx("clickable", styles.ColorSchemeToggleContainer, {
        [styles.loaded]: isLoaded
      })}
    >
      <input
        id={styles.ColorSchemeToggle}
        type="checkbox"
        checked={colorScheme === "dark"}
        onChange={toggleColorScheme}
        onKeyDown={(e) => {
          if (e.key === "Enter") toggleColorScheme();
        }}
        aria-label="Dark mode toggle"
      />
    </label>
  );
}
