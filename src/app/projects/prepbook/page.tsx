"use client";

import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "../../../components/Button";
import { Outlink } from "../../../components/Outlink";
import heroImg from "./hero.jpg";
import scalerImg from "./scaler.png";

export default function Page() {
  return (
    <>
      <h1>Prepbook</h1>
      <p className="description">Text-first recipe manager</p>
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

      <figure className="grid-wide">
        <Image src={heroImg} alt="A recipe in Prepbook" />
      </figure>

      <p>
        Prepbook is a recipe manager built around the text. A recipe is a plain
        document: write it the way you&apos;d jot it down for a friend, and
        Prepbook works out the ingredients, amounts and steps. Nothing to fill
        in, nothing to tag.
      </p>
      <p>
        I started it as a side project three years ago, after years of keeping
        recipes split between Paprika and Google Docs — one had the structure,
        the other had the writing. I designed the product and built the
        interface, editor and apps: one React Native codebase on iOS, Android
        and the web, in 20 languages.
      </p>

      <h2>Recipes as documents</h2>
      {/* <figure className="grid-wide">
        editor GIF: ingredient line → amount + ingredient; a step that says "the eggs" links back
      </figure> */}
      <p>
        Most recipe apps split a recipe into fields — tidy for the data, awkward
        for the writer. In Prepbook the recipe is the document: structure is
        read from the text, never asked for. The parsing is layered: regular
        expressions and classic parsing where the text is predictable, small
        purpose-trained neural networks, and an LLM for the cases those
        can&apos;t resolve.
      </p>
      <p>
        The hard part was a page that reads cleanly and is fully editable in
        place, with no separate edit mode. The editor is built on{" "}
        <Outlink href="https://tiptap.dev">TipTap</Outlink>, with custom nodes —
        amount chips, inline timers, ingredient links — mixed into the prose;
        each has to behave like text under the cursor, selection, copy and undo.
        Every version is kept, because a recipe changes a little every time you
        cook it.
      </p>

      <h2>Scaling</h2>
      <figure>
        <Image src={scalerImg} alt="Scaling a recipe in Prepbook" />
      </figure>
      <p>
        Because Prepbook knows where every amount sits in the text, scaling
        rewrites all of them, including the ones buried in the instructions. You
        don&apos;t pick a multiplier — you change the number in front of you,
        and the recipe follows.
      </p>

      <h2>Search</h2>
      {/* <figure className="grid-wide">
        search GIF: "something quick with leftover rice"
      </figure> */}
      <p>
        There are no tags or categories. Search runs on embeddings, so it
        understands a recipe the way you&apos;d describe it — an ingredient you
        have, a dish you&apos;re in the mood for, a half-remembered name — and
        works across languages. The structure lives in the app, so you can just
        write, and just ask.
      </p>

      <h2>Shipping it</h2>
      {/* <figure className="grid-wide">
        platform still: iOS, Android, web, and a shared link in a plain browser tab
      </figure> */}
      <p>
        A side project is a chance to own the whole product. Prepbook shipped as
        a real one — App Store and Play Store, a free tier and a subscription,
        20 languages — plus a few things I care about:
      </p>
      <ul>
        <li>Offline first; it syncs when it can.</li>
        <li>
          Sharing as a link that opens anywhere, no app or account on the other
          end. {/* TODO: shared recipe URL */}
          <Outlink href="TODO">Try one</Outlink>
        </li>
        <li>Import from a link, a video, or a photo of a cookbook page.</li>
        <li>
          Light and dark mode and a choice of typefaces. I picked a few and
          tuned one myself, iA Writer Quattro —{" "}
          <Link href="/writing/font-edit/">here&apos;s how</Link>. A cookbook
          should feel like something you chose.
        </li>
      </ul>

      <p>
        <ButtonLink
          href="https://prepbook.app"
          target="_blank"
          variant="opaque"
          rel="noreferrer"
        >
          Visit Prepbook <span className="arrow">↗</span>
        </ButtonLink>
      </p>
    </>
  );
}
