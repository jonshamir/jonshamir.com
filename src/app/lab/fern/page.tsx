"use client";

import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("./FernCanvas"), {
  ssr: false
});

export default function Page() {
  return <Canvas />;
}
