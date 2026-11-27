"use client";

import Link from "next/link";

import { ButtonLink } from "../../../components/Button";
import { Outlink } from "../../../components/Outlink";
import editClip from "./clips/edit.mp4";
import scaleClip from "./clips/scale.mp4";
import searchClip from "./clips/search.mp4";
import shareClip from "./clips/share.mp4";
import { type Feature, Features } from "./Features";
import { HeroScreenshot } from "./HeroScreenshot";
import styles from "./page.module.css";

const features: Feature[] = [
  {
    id: "recipes-as-documents",
    title: "Recipes as documents",
    src: editClip,
    label:
      "Typing “2.5 cloves garlic” at the end of an ingredient list; it becomes “2½ cloves garlic” with the amount in bold",
    content: (
      <>
        <p>
          Most recipe apps split a recipe into separate fields, which is easy
          for a computer but annoying for the person typing. In Prepbook you
          just write, and the structure is read from the text. The parsing is
          layered: regular expressions and classic parsing where the text is
          predictable, small purpose-trained neural networks, and an LLM for the
          cases those can&apos;t resolve.
        </p>
        <p>
          The hardest part was the editor. We wanted a page that reads like a
          finished recipe and is fully editable in place, with no separate edit
          mode. We built a custom editor where amount chips, timers and
          ingredient links all sit inline with the text. It also keeps a version
          history, so you can experiment with a recipe and keep an organized
          log.
        </p>
      </>
    )
  },
  {
    id: "scaling",
    title: "Scaling",
    src: scaleClip,
    label:
      "Tapping an amount opens the Scale Recipe dial; turning it rescales every ingredient in the list",
    content: (
      <>
        <p>
          Prepbook knows where every amount sits in the text, so you can click
          any amount and scale the whole recipe in proportion. The scaling
          control is inspired by vintage kitchen scales and takes any value from
          zero to infinity.
        </p>
      </>
    )
  },
  {
    id: "search",
    title: "Search",
    src: searchClip,
    label:
      "Searching “Italian”: three title matches appear, then more Italian dishes such as Spaghetti all’Amatriciana and Stracciatella Soup",
    content: (
      <>
        <p>
          When working on the search feature for prepbook I wanted something
          intuitive - searching for “Italian” should bring up gnocci, pasta and
          pizza. Search runs on vector embeddings, so you can describe a recipe
          the way you&apos;d remember it: an ingredient you have, a dish
          you&apos;re in the mood for etc. It works across languages, with no
          tags or categories to maintain.
        </p>
      </>
    )
  },
  {
    id: "sharing",
    title: "Sharing",
    src: shareClip,
    label:
      "Opening a recipe’s menu, choosing Share and copying its prepbook.app link",
    content: (
      <>
        <p>
          A recipe is shared as a link that opens anywhere, with no app or
          account needed on the other end.{" "}
          <Outlink href="https://prepbook.app/s/fa3ad6b9">Try one</Outlink>
        </p>
      </>
    )
  }
];

export default function Page() {
  return (
    <>
      <h1>Prepbook</h1>
      <p className="description">Minimal recipe manager</p>

      <p>
        Prepbook is a clean and minimal recipe manager built around text. A
        recipe is a plain document: nothing to fill in, nothing to tag - it
        reads the structure from what you write. It&apos;s available as a web
        application, plus native iOS and Android apps.
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
        Prepbook started as a side project in 2024. My recipes were split
        between dedicated recipe apps and Google Docs, and I wanted the
        simplicity of a text document with the features of a recipe app. I
        designed the product and built it with my friend Jordan, using it to
        organize our recipes along the way.
      </p>

      <Features features={features}>
        {/* <figure className="grid-wide">
          platform still: iOS, Android, web, and a shared link in a plain browser tab
        </figure> */}
        <h2>And the rest</h2>
        <p>
          Prepbook shipped as a full product: App Store and Play Store, a free
          tier and a subscription, 20 languages. A few other things I cared
          about:
        </p>
        <ul>
          <li>Import from a link, a video, or a photo of a cookbook page.</li>
          <li>Offline first, with sync across devices and platforms.</li>
          <li>
            Light and dark mode and a choice of typefaces, including{" "}
            <Link href="/writing/font-edit/">
              one I modified for this project
            </Link>
            .
          </li>
        </ul>
      </Features>

      <p className={styles.cta}>
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
