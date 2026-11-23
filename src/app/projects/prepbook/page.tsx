"use client";

import Link from "next/link";

import { ButtonLink } from "../../../components/Button";
import { Outlink } from "../../../components/Outlink";
import editClip from "./clips/edit.mp4";
import scaleClip from "./clips/scale.mp4";
import searchClip from "./clips/search.mp4";
import shareClip from "./clips/share.mp4";
import { HeroScreenshot } from "./HeroScreenshot";
import styles from "./page.module.css";

export default function Page() {
  return (
    <>
      <h1>Prepbook</h1>
      <p className="description">Text-first recipe manager</p>

      <p>
        Prepbook is a recipe manager built around the text. A recipe is a plain
        document: write it the way you&apos;d jot it down for a friend, and
        Prepbook works out the ingredients, amounts and steps. Nothing to fill
        in, nothing to tag.
      </p>

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
        <HeroScreenshot />
      </figure>

      <p>
        We started it as a side project three years ago, after years of keeping
        recipes split between Paprika and Google Docs — one had the structure,
        the other had the writing. I designed the product and built with my
        friend Jordan, using it to organize our recipes along the way.
      </p>

      <h2>Recipes as documents</h2>
      <figure>
        <video
          className={styles.clip}
          src={editClip}
          aria-label="Typing “2.5 cloves garlic” at the end of an ingredient list; it becomes “2½ cloves garlic” with the amount in bold"
          playsInline
          autoPlay
          muted
          loop
        />
        <figcaption>
          Type an ingredient line the way you&apos;d say it. Prepbook picks out
          the amount and unit, and tidies 2.5 into 2½.
        </figcaption>
      </figure>
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
        <video
          className={styles.clip}
          src={scaleClip}
          aria-label="Tapping an amount opens the Scale Recipe dial; turning it rescales every ingredient in the list"
          playsInline
          autoPlay
          muted
          loop
        />
        <figcaption>
          Tap any amount and drag the dial. Every other ingredient follows in
          proportion.
        </figcaption>
      </figure>
      <p>
        Because Prepbook knows where every amount sits in the text, you can just
        click an amount and the whole recipe scales in proportion. The scaling
        is a mix of rules and LLMs, so it can handle the tricky cases - &ldquo;a
        pinch&rdquo; or &ldquo;a few&rdquo; - and even scale across units and
        languages.
      </p>

      <h2>Search</h2>
      <figure>
        <video
          className={styles.clip}
          src={searchClip}
          aria-label="Searching “Italian”: three title matches appear, then more Italian dishes such as Spaghetti all’Amatriciana and Stracciatella Soup"
          playsInline
          autoPlay
          muted
          loop
        />
        <figcaption>
          Title matches come back instantly; a moment later, embedding search
          adds dishes that are Italian without saying so.
        </figcaption>
      </figure>
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
          end. <Outlink href="https://prepbook.app/s/fa3ad6b9">Try one</Outlink>
        </li>
        <li>Import from a link, a video, or a photo of a cookbook page.</li>
        <li>
          Light and dark mode and a choice of typefaces. I picked a few and
          tuned one myself, iA Writer Quattro —{" "}
          <Link href="/writing/font-edit/">here&apos;s how</Link>. A cookbook
          should feel like something you chose.
        </li>
      </ul>
      <figure>
        <video
          className={styles.clip}
          src={shareClip}
          aria-label="Opening a recipe’s menu, choosing Share and copying its prepbook.app link"
          playsInline
          autoPlay
          muted
          loop
        />
        <figcaption>
          Sharing makes a link that opens in any browser, with no app or account
          needed.
        </figcaption>
      </figure>

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
