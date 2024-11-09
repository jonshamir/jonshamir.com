"use client";

import { Outlink } from "../../../components/Outlink";

export default function Page() {
  return (
    <>
      <img src="/projects/leaf-map/hero.png" alt="" className="cover" />

      <h1>Leaf Map</h1>
      <span className="description">Interactive map of leaf shapes</span>
      <br />
      <br />
      <a
        href="https://jonshamir.github.io/leaf-map/"
        target="_blank"
        className="button"
        rel="noreferrer"
      >
        Visit Project <span className="arrow">↗</span>
      </a>
      <p>
        I used machine learning techniques to organize tree species according to
        their leaf shape. The idea was to create a more intuitive and friendly
        way to recognize plant species.{" "}
      </p>

      <img src="/projects/leaf-map/features.png" alt="Leaf features" />
      <p>
        Using the{" "}
        <Outlink href="https://en.wikipedia.org/wiki/Shape_context">
          Shape Context Algorithm
        </Outlink>{" "}
        I generated a &quot;fingerprint&quot; vector representing each leaf,
        which is then used to asses the similarity of shapes. Finally the
        dimension of this vector is reduced to 2D using PCA and{" "}
        <Outlink href="https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding">
          t-SNE
        </Outlink>
        , and the leaves are displayed in an interactive interface I created
        using D3.js.
      </p>
      <p>
        The project was inspired by the{" "}
        <Outlink href="https://www.designboom.com/design/ideo-font-map-interview-typography-04-21-2017/">
          IDEO Font Map
        </Outlink>
        , all data and images were taken from the{" "}
        <Outlink href="https://leafsnap.com/dataset/">
          Leaf Snap dataset
        </Outlink>
        .{" "}
      </p>
      <h2>Tools Used</h2>
      <ul>
        <li>JavaScript</li>
        <li>Python (data processing)</li>
      </ul>
    </>
  );
}
