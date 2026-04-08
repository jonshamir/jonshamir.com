"use client";

import Image from "next/image";

import { ButtonLink } from "../../../components/Button";
import scalerImg from "./scaler.png";

export default function Page() {
  return (
    <>
      <h1>Prepbook</h1>
      <p className="description">Clever recipe notebook</p>
      <p>
        <ButtonLink
          href="https://prepbook.app"
          target="_blank"
          variant="opaque"
          rel="noreferrer"
        >
          Visit Project <span className="arrow">↗</span>
        </ButtonLink>
      </p>
      <p>
        I&apos;ve been using a notebook to jot down recipes for years. It&apos;s
        a pain to keep it updated and find the right recipe when I need it.
      </p>
      <p>
        Prepbook is a simple recipe notebook that allows me to keep track of my
        recipes and find them when I need them.
      </p>
      <figure>
        <Image src={scalerImg} alt="Recipe Scaler" />
        <figcaption>The Ingredient-based Recipe Scaler</figcaption>
      </figure>
    </>
  );
}
