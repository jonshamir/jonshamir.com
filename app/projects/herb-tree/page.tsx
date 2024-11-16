"use client";

export default function Page() {
  return (
    <>
      <img src="/projects/herb-tree/hero.png" alt="" className="cover" />
      <h1>Herbarium</h1>
      <span className="description">Interactive botanic visualization</span>
      <p>
        An online index of culinary herbs, created as the final project for my
        Visual Communication degree. The plants are organized according to their
        scientific classification, creating a herbal “tree of life”. Each herb
        contains a description as well as information about using it in the
        kitchen. In addition to research, design and development, I photographed
        dozens of plant specimens from the HUJI Herbarium, which are
        incorporated into the project.
      </p>
      <figure>
        <img
          src="/projects/herb-tree/specimen.jpg"
          alt="Photographing a Specimen"
        />
        <figcaption>Photographing a specimen for the project.</figcaption>
      </figure>
      <h2> Tools Used</h2>
      <ul>
        <li>JavaScript (d3.js + React.js)</li>
        <li>Python</li>
        <li>Photography</li>
      </ul>
    </>
  );
}
