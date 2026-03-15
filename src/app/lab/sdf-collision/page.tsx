"use client";

import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("./SdfCollisionCanvas"), {
  ssr: false
});

export default function Page() {
  return (
    <div style={{ touchAction: "none", overflow: "hidden", height: "100dvh" }}>
      <Canvas />
    </div>
  );
}
