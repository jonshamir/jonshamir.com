// src/components/TweakpanePanel.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import { getPane } from "../lib/tweakpane";

function TweakpanePanelInner() {
  const searchParams = useSearchParams();
  const debug = searchParams.has("debug");
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

  return (
    <div
      ref={hostRef}
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

export function TweakpanePanel() {
  return (
    <Suspense fallback={null}>
      <TweakpanePanelInner />
    </Suspense>
  );
}
