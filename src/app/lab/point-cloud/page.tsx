"use client";

import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("./PointCloudCanvas"), {
  ssr: false
});

export default function Page() {
  return (
    <>
      <Canvas />
    </>
  );
}
