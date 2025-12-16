"use client";

import { ReactNode, useState } from "react";

import styles from "./ColorModeToggleDemo.module.css";

type ColorModeToggleDemoProps = {
  showToggle: boolean;
  isAnimated: boolean;
  useAtProp: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
};

export function ColorModeToggleDemo({
  showToggle,
  isAnimated,
  useAtProp,
  children,
  style
}: ColorModeToggleDemoProps) {
  const [isDark, setIsDark] = useState(false);
  return (
    <figure>
      <div
        className={`${styles.ColorModeToggleDemo} ${isDark ? styles.dark : ""}  ${isAnimated ? styles.animated : ""}`}
        style={style}
      >
        {children}
        {!showToggle && (
          <button
            onClick={() => setIsDark(!isDark)}
            className={`${styles.InvertedButton} ${useAtProp ? styles.useAtProp : ""}`}
          >
            {isDark ? "Set Dark Mode" : "Set Light Mode"}
          </button>
        )}
        {showToggle && (
          <button
            onClick={() => setIsDark(!isDark)}
            className={styles.AnimatedButton}
          >
            <svg
              className={styles.ColorModeToggle}
              width="48"
              height="48"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="8"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                className={styles.RightSideBG}
                d="M 12 5 A 7 7 0 0 1 12 19"
              />
              <path className={styles.LeftSide} d="M 12 5 A 7 7 0 0 1 12 19" />
              <path className={styles.RightSide} d="M 12 5 A 7 7 0 0 1 12 19" />
            </svg>
          </button>
        )}
      </div>
    </figure>
  );
}
