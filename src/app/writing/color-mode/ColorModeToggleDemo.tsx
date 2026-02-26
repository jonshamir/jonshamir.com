"use client";

import { ReactNode, useRef, useState } from "react";
import { flushSync } from "react-dom";

import styles from "./ColorModeToggleDemo.module.css";

type ColorModeToggleDemoProps = {
  showToggle: boolean;
  isAnimated: boolean;
  useAtProp: boolean;
  useViewTransition?: boolean;
  useCircularReveal?: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
};

export function ColorModeToggleDemo({
  showToggle,
  isAnimated,
  useAtProp,
  useViewTransition,
  useCircularReveal,
  children,
  style
}: ColorModeToggleDemoProps) {
  const [isDark, setIsDark] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggle = async () => {
    if (
      useCircularReveal &&
      document.startViewTransition &&
      buttonRef.current
    ) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      document.documentElement.classList.add("circular-reveal-active");
      try {
        const transition = document.startViewTransition(() => {
          flushSync(() => setIsDark(!isDark));
        });
        await transition.ready;

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 500,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)"
          }
        );
        await transition.finished;
      } finally {
        document.documentElement.classList.remove("circular-reveal-active");
      }
    } else if (useViewTransition && document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => setIsDark(!isDark));
      });
    } else {
      setIsDark(!isDark);
    }
  };

  return (
    <figure>
      <div
        className={`${styles.ColorModeToggleDemo} ${isDark ? styles.dark : ""}  ${isAnimated ? styles.animated : ""}`}
        style={style}
      >
        {children}
        {!showToggle && (
          <button
            ref={buttonRef}
            onClick={toggle}
            className={`${styles.InvertedButton} ${useAtProp ? styles.useAtProp : ""}`}
          >
            {isDark ? "Set Dark Mode" : "Set Light Mode"}
          </button>
        )}
        {showToggle && (
          <button
            ref={buttonRef}
            onClick={toggle}
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
