"use client";

import Canvas from "./Canvas";

export default function Page() {
  return (
    <>
      <h1>Earth Projections</h1>
      <p>
        This is an experiment implementing a spherical projection mapping shader
        in Three.js. Projection mapping is a texturing technique used to project
        images onto three-dimensional objects.
      </p>
      <p>Click the shapes to see the Earth projected onto them:</p>
      <Canvas />
    </>
  );
}
