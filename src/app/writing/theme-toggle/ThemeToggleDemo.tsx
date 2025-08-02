"use client";

import { ReactNode, useState } from "react";

import styles from "./ThemeToggleDemo.module.css";

type ThemeToggleDemoProps = {
  showFullToggle: boolean;
  isAnimated: boolean;
  children: ReactNode;
};

export function ThemeToggleDemo({
  showFullToggle,
  isAnimated,
  children
}: ThemeToggleDemoProps) {
  const [isDark, setIsDark] = useState(false);
  return (
    <figure>
      <div
        className={`${styles.ThemeToggleDemo} ${isDark ? styles.dark : ""}  ${isAnimated ? styles.animated : ""}`}
      >
        {children}
        {!showFullToggle && (
          <button onClick={() => setIsDark(!isDark)}>
            {isDark ? "Set Dark Mode" : "Set Light Mode"}
          </button>
        )}
        {showFullToggle && (
          <button
            className={`${styles.ThemeToggle}`}
            onClick={() => setIsDark(!isDark)}
          />
        )}
      </div>
    </figure>
  );
}
