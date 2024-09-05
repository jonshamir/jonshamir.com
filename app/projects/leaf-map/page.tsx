"use client";

export default function Page() {
  return (
    <>
      <img src="/projects/leaf-map/hero.png" alt="" className="hero" />

      <h1>Leaf Map</h1>
      <span className="description">Interactive map of leaf shapes</span>
      <p>
        I used machine learning techniques to organize tree species according to
        their leaf shape. The idea was to create a more intuitive and friendly
        way to recognize plant species.{" "}
      </p>

      <img src="/projects/leaf-map/features.png" alt="Leaf features" />
      <p>
        Using the [Shape Context
        Algorithm](https://en.wikipedia.org/wiki/Shape_context) I generated a
        "fingerprint" vector representing each leaf, which is then used to asses
        the similarity of shapes. Finally the dimension of this vector is
        reduced to 2D using PCA and
        [t-SNE](https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding),
        and the leaves are displayed in an interactive interface I created using
        D3.js.
      </p>
      <p>
        The project was inspired by the [IDEO Font
        Map](https://www.designboom.com/design/ideo-font-map-interview-typography-04-21-2017/),
        all data and images were taken from the [Leaf Snap
        dataset](https://leafsnap.com/dataset/).
      </p>
      <h2>Tools Used</h2>
      <ul>
        <li>JavaScript</li>
        <li>Python (data processing)</li>
      </ul>
    </>
  );
}
