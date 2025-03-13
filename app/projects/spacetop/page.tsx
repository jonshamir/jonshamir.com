"use client";

export default function Page() {
  return (
    <>
      <h1>Spacetop</h1>
      <span className="description">Augmented reality laptop OS</span>
      <p>
        <a
          href="https://www.sightful.com/"
          target="_blank"
          className="button"
          rel="noreferrer"
        >
          Visit Project <span className="arrow">↗</span>
        </a>
      </p>
      <p>
        Spacetop is a spatial operating system designed to work with AR glasses
        to replace physical external monitors while on the go. Translating the
        traditional desktop user interface to a 3D environment provided many
        challenges, both in design and implementation.{" "}
      </p>

      <figure className="full-bleed">
        <img
          src="/projects/spacetop/hero.png"
          alt="Leaves sorted by shape"
          style={{ maxHeight: "450px", height: "auto", maxWidth: "1000px" }}
        />
        <figcaption>
          A rendering demonstrating the use of Spacetop - the windows float
          around the user in 3D space, while the environment is visible
        </figcaption>
      </figure>

      <p>
        Spacetop is a spatial operating system designed to work with AR glasses
        to replace physical external monitors while on the go. Translating the
        traditional desktop user interface to a 3D environment provided many
        challenges, both in design and implementation.{" "}
      </p>
    </>
  );
}
