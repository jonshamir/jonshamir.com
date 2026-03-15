"use client";

import { Leva } from "leva";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

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
      <Leva fill flat />
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
