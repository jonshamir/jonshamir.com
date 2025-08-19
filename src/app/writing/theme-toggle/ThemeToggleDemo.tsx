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
        {!showToggle && (
          <button onClick={() => setIsDark(!isDark)}>
            {isDark ? "Set Dark Mode" : "Set Light Mode"}
          </button>
        )}
        {showToggle && (
          <button
            onClick={() => setIsDark(!isDark)}
            style={{ background: "transparent" }}
          >
            <svg
              className={styles.ThemeToggle}
              width="48"
              height="48"
              viewBox="0 0 24 24"
            >
              <circle
                className="base"
                cx="12"
                cy="12"
                r="7.8"
                mask="url(#half-mask)"
                stroke="currentColor"
                strokeWidth="2"
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
