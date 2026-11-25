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

function FeatureClip({
  title,
  src,
  label,
  caption,
  children
}: {
  title: string;
  src: string;
  label: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`flow ${styles.feature}`}>
      <h2 className={styles.title}>{title}</h2>
      <figure className={styles.figure}>
        <video
          className={styles.clip}
          src={src}
          aria-label={label}
          playsInline
          autoPlay
          muted
          loop
        />
        <figcaption>{caption}</figcaption>
      </figure>
      <div className={`flow ${styles.text}`}>{children}</div>
    </section>
  );
}

export default function Page() {
  return (
    <>
      <h1>Prepbook</h1>
      <p className="description">Minimal recipe manager</p>

      <p>
        Prepbook is a clean and minimal recipe manager built around text. A
        recipe is a plain document: nothing to fill in, nothing to tag. It is
        available as a web application, plus native iOS and Android apps.
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
        Started as a side project years ago, after keeping recipes split between
        dedicated apps and Google Docs, I wanted a solution that would combine
        the simplicity of text with the features of a recipe app. I designed the
        product and built it with my friend Jordan, using it to organize our
        recipes along the way.
      </p>

      <FeatureClip
        title="Recipes as documents"
        src={editClip}
        label="Typing “2.5 cloves garlic” at the end of an ingredient list; it becomes “2½ cloves garlic” with the amount in bold"
        caption="Type an ingredient line the way you'd say it. Prepbook picks out the amount and unit, and tidies 2.5 into 2½."
      >
        <p>
          Most recipe apps split a recipe into fields — tidy for the data,
          awkward for the writer. In Prepbook the recipe is the document:
          structure is read from the text, never asked for. The parsing is
          layered: regular expressions and classic parsing where the text is
          predictable, small purpose-trained neural networks, and an LLM for the
          cases those can&apos;t resolve.
        </p>
        <p>
          The hard part was a page that reads cleanly and is fully editable in
          place, with no separate edit mode. The editor is built on{" "}
          <Outlink href="https://tiptap.dev">TipTap</Outlink>, with custom nodes
          — amount chips, inline timers, ingredient links — mixed into the
          prose; each has to behave like text under the cursor, selection, copy
          and undo. Every version is kept, because a recipe changes a little
          every time you cook it.
        </p>
      </FeatureClip>

      <FeatureClip
        title="Scaling"
        src={scaleClip}
        label="Tapping an amount opens the Scale Recipe dial; turning it rescales every ingredient in the list"
        caption="Tap any amount and drag the dial. Every other ingredient follows in proportion."
      >
        <p>
          Because Prepbook knows where every amount sits in the text, you can
          just click an amount and the whole recipe scales in proportion. The
          scaling is a mix of rules and LLMs, so it can handle the tricky cases
          - &ldquo;a pinch&rdquo; or &ldquo;a few&rdquo; - and even scale across
          units and languages.
        </p>
      </FeatureClip>

      <FeatureClip
        title="Search"
        src={searchClip}
        label="Searching “Italian”: three title matches appear, then more Italian dishes such as Spaghetti all’Amatriciana and Stracciatella Soup"
        caption="Title matches come back instantly; a moment later, embedding search adds dishes that are Italian without saying so."
      >
        <p>
          There are no tags or categories. Search runs on embeddings, so it
          understands a recipe the way you&apos;d describe it — an ingredient
          you have, a dish you&apos;re in the mood for, a half-remembered name —
          and works across languages. The structure lives in the app, so you can
          just write, and just ask.
        </p>
      </FeatureClip>

      {/* <figure className="grid-wide">
        platform still: iOS, Android, web, and a shared link in a plain browser tab
      </figure> */}
      <FeatureClip
        title="Shipping it"
        src={shareClip}
        label="Opening a recipe’s menu, choosing Share and copying its prepbook.app link"
        caption="Sharing makes a link that opens in any browser, with no app or account needed."
      >
        <p>
          A side project is a chance to own the whole product. Prepbook shipped
          as a real one — App Store and Play Store, a free tier and a
          subscription, 20 languages — plus a few things I care about:
        </p>
        <ul>
          <li>Offline first; it syncs when it can.</li>
          <li>
            Sharing as a link that opens anywhere, no app or account on the
            other end.{" "}
            <Outlink href="https://prepbook.app/s/fa3ad6b9">Try one</Outlink>
          </li>
          <li>Import from a link, a video, or a photo of a cookbook page.</li>
          <li>
            Light and dark mode and a choice of typefaces. I picked a few and
            tuned one myself, iA Writer Quattro —{" "}
            <Link href="/writing/font-edit/">here&apos;s how</Link>. A cookbook
            should feel like something you chose.
          </li>
        </ul>
      </FeatureClip>

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
