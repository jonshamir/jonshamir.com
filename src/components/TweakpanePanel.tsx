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

  return <div ref={hostRef} className={styles.host} />;
}
