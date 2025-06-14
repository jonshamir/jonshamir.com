"use client";

import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("./Canvas"), {
  ssr: false
});

export default function Page() {
  return (
    <>
      <h1>Plant</h1>
      <p>Plant growth</p>
      <Canvas />
    </>
  );
}
