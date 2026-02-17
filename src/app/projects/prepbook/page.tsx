"use client";

import { ButtonLink } from "../../../components/Button";

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
    </>
  );
}
