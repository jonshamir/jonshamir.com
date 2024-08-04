import styles from "./FloatingMenu.module.scss";

import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { useTheme } from "next-themes";

export function FloatingMenu() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <div className={styles.FloatingMenu}>
      <span className={styles.item} style={{ padding: "0.2rem" }}>
        <span suppressHydrationWarning>{isDark ? "Light" : "Dark"} Mode</span>
        <ThemeToggle />
      </span>
    </div>
  );
}
