"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

import type { ComposeBodyProps } from "../ComposeShell";

const ImagineScene = dynamic(() => import("./ImagineScene"), { ssr: false });

export function ImagineBody({
  sceneAsset,
  phase,
  onAdvance,
  measureRef
}: ComposeBodyProps & { sceneAsset: string }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    measureRef(wrapperRef.current);
  }, [measureRef]);

  return (
    <div ref={wrapperRef} style={{ width: 280, height: 220 }}>
      <ImagineScene
        sceneAsset={sceneAsset}
        phase={phase}
        onAdvance={onAdvance}
      />
    </div>
  );
}
