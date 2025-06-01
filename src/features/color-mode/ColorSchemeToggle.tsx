import clsx from "clsx";
import { useEffect, useState } from "react";

import styles from "./ColorSchemeToggle.module.scss";
import { useColorScheme } from "./useColorScheme";

export function ColorSchemeToggle() {
  const { isDark, setIsDark } = useColorScheme();

  const toggleColorScheme = () => {
    setIsDark(!isDark);
  };

  return (
    <label
      htmlFor={styles.ColorSchemeToggle}
      className={clsx("clickable", styles.ColorSchemeToggleContainer)}
    >
      <input
        id={styles.ColorSchemeToggle}
        type="checkbox"
        checked={isDark}
        onChange={toggleColorScheme}
        onKeyDown={(e) => {
          if (e.key === "Enter") toggleColorScheme();
        }}
        aria-label="Dark mode toggle"
      />
    </label>
  );
}
