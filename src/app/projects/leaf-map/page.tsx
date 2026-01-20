"use client";

import { Outlink } from "../../../components/Outlink";

export default function Page() {
  return (
    <>
      <h1>Leaf Map</h1>
      <p className="description">Interactive map of leaf shapes</p>
      <p>
        <a
          href="https://jonshamir.github.io/leaf-map/"
          target="_blank"
          className="button"
          rel="noreferrer"
        >
          Visit Project <span className="arrow">↗</span>
        </a>
      </p>
      <p>
        I&apos;ve always been fascinated by the shapes of plants. While studying
        Dimensionality Reduction and data visualization techniques, I applied
        these concepts to categorize tree species based on leaf shapes. My goal
        was to develop a more intuitive and user-friendly approach to plant
        species identification.
      </p>

      <figure className="grid-wide">
        <img
          src="/projects/leaf-map/hero.png"
          alt="Leaves sorted by shape"
          style={{ maxHeight: "300px", height: "auto" }}
        />
      </figure>

      <p>
        Using the{" "}
        <Outlink href="https://en.wikipedia.org/wiki/Shape_context">
          Shape Context Algorithm
        </Outlink>{" "}
        I generated a &quot;fingerprint&quot; vector representing each leaf. The
        vectors of similarly shaped leaves lie closer to each other in
        n-dimensional space. To display a 2D map of the leaves I reduced the
        dimensionality using a combination of PCA and{" "}
        <Outlink href="https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding">
          t-SNE
        </Outlink>
        .
      </p>
      <figure>
        <img src="/projects/leaf-map/features.png" alt="Leaf features" />
      </figure>
      <p>
        Finally the leaves are displayed on an interactive canvas I created
        using D3.js. The project was inspired by the{" "}
        <Outlink href="https://www.designboom.com/design/ideo-font-map-interview-typography-04-21-2017/">
          IDEO Font Map
        </Outlink>
        , all data and images were taken from the{" "}
        <Outlink href="https://leafsnap.com/dataset/">
          Leaf Snap dataset
        </Outlink>
        .
      </p>
    </>
  );
}
