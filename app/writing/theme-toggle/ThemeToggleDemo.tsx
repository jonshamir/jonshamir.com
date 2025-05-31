"use client";

import { useState } from "react";

import styles from "./ThemeToggleDemo.module.css";

export function ThemeToggleDemo() {
  const [isDark, setIsDark] = useState(false);
  return (
    <div className={`${styles.ThemeToggleDemo} ${isDark ? styles.isDark : ""}`}>
      <button
        className={`${styles.ThemeToggle}`}
        onClick={() => setIsDark(!isDark)}
      />
    </div>
  );
}
