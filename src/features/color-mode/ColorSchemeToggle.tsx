import clsx from "clsx";

import styles from "./ColorSchemeToggle.module.scss";
import { useColorScheme } from "./useColorScheme";

export function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  return (
    <label
      htmlFor={styles.ColorSchemeToggle}
      className={clsx("clickable", styles.ColorSchemeToggleContainer)}
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
