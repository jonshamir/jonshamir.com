"use client";

import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("./CratersCanvas"), {
  ssr: false
});

export default function Page() {
  return (
    <>
      <h1>Moon Craters</h1>
      <p>Map of moon craters over 100 km in diameter</p>
      <Canvas />
    </>
  );
}
