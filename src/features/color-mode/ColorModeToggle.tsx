import { clsx } from "clsx";
import { useEffect, useState } from "react";

import styles from "./ColorModeToggle.module.scss";
import { useColorMode } from "./useColorMode";

export function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 500);
  }, []);

  return (
    <label
      htmlFor={styles.ColorModeToggle}
      className={clsx("clickable", styles.ColorModeToggleContainer, {
        [styles.loaded]: isLoaded
      })}
    >
      <input
        id={styles.ColorModeToggle}
        type="checkbox"
        checked={colorMode === "dark"}
        onChange={toggleColorMode}
        onKeyDown={(e) => {
          if (e.key === "Enter") toggleColorMode();
        }}
        aria-label="Dark mode toggle"
      />
    </label>
  );
}
