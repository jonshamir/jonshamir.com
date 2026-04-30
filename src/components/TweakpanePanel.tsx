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

  // Use a global (non-hashed) class for fixed positioning — see
  // src/styles/three-canvas.css. Avoids CSS-module hash desync during Fast
  // Refresh. The module class still provides Tweakpane theme overrides.
  return <div ref={hostRef} className={`${styles.host} tweakpane-host`} />;
}
