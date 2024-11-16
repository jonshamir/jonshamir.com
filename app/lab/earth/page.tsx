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
      <p>
        <br />
        Usually textures are mapped to 3d meshes using explicit uv mapping -
        each vertex is assigned specific uv (texture-space) coordinates.
        Projection mapping is a texture mapping technique that calculates uv
        coordinates dynamically from vertex positions.
      </p>
      <p>
        You might notice a little seam on one side of the Earth. This is due to
        the way the uv coordinates are calculated. The problem is described in
        detail in{" "}
        <a href="https://bgolus.medium.com/distinctive-derivative-differences-cce38d36797b">
          Distinctive Derivative Differences
        </a>{" "}
        Pesky Problems with Procedural UVs
      </p>
    </>
  );
}
