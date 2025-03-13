"use client";

import { Outlink } from "../../../components/Outlink";

export default function Page() {
  return (
    <>
      <h1>Prepbook</h1>
      <span className="description">Clever recipe notebook</span>
      <p>
        <a
          href="https://prepbook.app"
          target="_blank"
          className="button"
          rel="noreferrer"
        >
          Visit Project <span className="arrow">↗</span>
        </a>
      </p>
      <p>
        I've been using a notebook to jot down recipes for years. It's a pain to
        keep it updated and find the right recipe when I need it.
      </p>
      <p>
        Prepbook is a simple recipe notebook that allows me to keep track of my
        recipes and find them when I need them.
      </p>
    </>
  );
}
