import { clsx } from "clsx";
import { useEffect, useState } from "react";

import { Button } from "../../components/Button";
import styles from "./ColorModeToggle.module.scss";
import { useColorMode } from "./useColorMode";

export function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 500);
  }, []);

  return (
    <Button
      round
      className={clsx(styles.ColorModeToggleContainer, {
        [styles.loaded]: isLoaded,
        [styles.dark]: colorMode === "dark"
      })}
      onClick={toggleColorMode}
      onKeyDown={(e) => {
        if (e.key === "Enter") toggleColorMode();
      }}
      aria-label="Dark mode toggle"
    >
      <svg
        className={styles.ColorModeToggle}
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path className={styles.RightSideBG} d="M 12 5 A 7 7 0 0 1 12 19" />
        <path className={styles.LeftSide} d="M 12 5 A 7 7 0 0 1 12 19" />
        <path className={styles.RightSide} d="M 12 5 A 7 7 0 0 1 12 19" />

        <circle cx="12" cy="12" r="8" strokeWidth="2" fill="none" />
      </svg>
    </Button>
  );
}
