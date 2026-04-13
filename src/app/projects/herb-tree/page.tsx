"use client";

import heroImg from "./hero.png";
import specimenImg from "./specimen.jpg";

export default function Page() {
  return (
    <>
      <img src={heroImg.src} alt="" className="cover" />
      <h1>Herbarium</h1>
      <p className="description">Interactive botanic visualization</p>
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
        <img src={specimenImg.src} alt="Photographing a Specimen" />
        <figcaption>Photographing a specimen for the project.</figcaption>
      </figure>
    </>
  );
}
