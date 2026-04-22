// src/components/TweakpanePanel.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import { getPane } from "../lib/tweakpane";
import styles from "./TweakpanePanel.module.css";

function TweakpanePanelInner() {
  const searchParams = useSearchParams();
  const debug = true; //searchParams.has("debug");
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!debug) return;
    const host = hostRef.current;
    if (!host) return;
    const pane = getPane();
    host.appendChild(pane.element);
    return () => {
      if (pane.element.parentElement === host) {
        host.removeChild(pane.element);
      }
    };
  }, [debug]);

  if (!debug) return null;

  return <div ref={hostRef} className={styles.host} />;
}

export function TweakpanePanel() {
  return (
    <Suspense fallback={null}>
      <TweakpanePanelInner />
    </Suspense>
  );
}
