"use client";

import { ReactNode, useState } from "react";

import styles from "./ThemeToggleDemo.module.css";

type ThemeToggleDemoProps = {
  showToggle: boolean;
  isAnimated: boolean;
  children: ReactNode;
};

export function ThemeToggleDemo({
  showToggle,
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
        {showToggle && (
          <button
            className={`${styles.ThemeToggle}`}
            onClick={() => setIsDark(!isDark)}
          />
        )}
      </div>
    </figure>
  );
}
