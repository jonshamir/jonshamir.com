"use client";

import { ReactNode, useState } from "react";

import styles from "./ThemeToggleDemo.module.css";

type ThemeToggleDemoProps = {
  showFancyToggle: boolean;
  isAnimated: boolean;
  children: ReactNode;
};

export function ThemeToggleDemo({
  showFancyToggle,
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
        {!showFancyToggle && (
          <button onClick={() => setIsDark(!isDark)}>
            {isDark ? "Set Dark Mode" : "Set Light Mode"}
          </button>
        )}
        {showFancyToggle && (
          <button
            className={`${styles.ThemeToggle}`}
            onClick={() => setIsDark(!isDark)}
          />
        )}
        <svg
          className="theme-toggle"
          width="48"
          height="48"
          viewBox="0 0 24 24"
        >
          <circle
            className="base"
            cx="12"
            cy="12"
            r="8"
            mask="url(#mask)"
            fill="currentColor"
          />

          <mask id="mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <path
              className="maskPath"
              d="M 12 5 A 7 7 0 0 1 12 19"
              fill="black"
              style={{
                transformOrigin: "center",
                transform: "rotateY(180deg)"
              }}
            />
          </mask>
        </svg>
      </div>
    </figure>
  );
}
