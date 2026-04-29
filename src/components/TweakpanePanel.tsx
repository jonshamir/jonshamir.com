"use client";

import { useEffect, useRef } from "react";

import { getPane } from "../lib/tweakpane";
import styles from "./TweakpanePanel.module.css";

export function TweakpanePanel() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const pane = getPane();
    host.appendChild(pane.element);
    return () => {
      if (pane.element.parentElement === host) {
        host.removeChild(pane.element);
      }
    };
  }, []);

  // Inline positioning so HMR can't desync the CSS-module class hash and drop position:fixed.
  return (
    <div
      ref={hostRef}
      className={styles.host}
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        width: 280,
        zIndex: 1000
      }}
    />
  );
}
