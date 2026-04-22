"use client";

import { Leva } from "leva";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LevaPanelInner() {
  const searchParams = useSearchParams();
  const debug = searchParams.has("debug");

  if (!debug) return <Leva hidden />;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        width: 280,
        zIndex: 1000
      }}
    >
      <Leva fill flat hideCopyButton />
    </div>
  );
}

export function LevaPanel() {
  return (
    <Suspense fallback={<Leva hidden />}>
      <LevaPanelInner />
    </Suspense>
  );
}
