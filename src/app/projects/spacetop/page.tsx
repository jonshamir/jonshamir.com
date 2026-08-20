"use client";

import Image from "next/image";

import { ButtonLink } from "../../../components/Button";
import AwardAweIcon from "./award-awe.svg";
import awardCesImg from "./award-ces.png";
import AwardFcIcon from "./award-fc.svg";
import awardTimeImg from "./award-time.png";
import bevelImg from "./bevel.gif";
import compassImg from "./compass.gif";
import cursorMoveImg from "./cursor-move.gif";
import heroImg from "./hero.jpg";
import navImg from "./nav.gif";

export default function Page() {
  return (
    <>
      <h1>Spacetop</h1>
      <p className="description">Augmented reality laptop OS</p>
      <p>
        Spacetop is a spatial operating system, designed to work with a
        keyboard, mouse and augmented reality glasses as a display. Unlike other
        XR products, Spacetop has a minimal learning curve and is intuitive to
        first-time users because it builds upon traditional desktop interaction
        paradigms.
      </p>

      <figure className="grid-wide">
        <Image
          src={heroImg}
          alt="Illustration of Spacetop being used on an airplane"
          style={{ maxHeight: "450px" }}
        />
        <figcaption>
          Spacetop is like a huge virtual screen that you can take anywhere
        </figcaption>
      </figure>

      <p>
        Spacetop&apos;s unique approach to spatial computing resonated beyond
        just the XR community, earning <i>Best of Show at CES 2024</i>,{" "}
        <i>TIME Best Invention of 2023</i>, and recognition from{" "}
        <i>Fast Company</i> as one of the{" "}
        <i>Top 10 Most Innovative CE Companies of 2024</i>.
      </p>

      <figure>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "2rem"
          }}
        >
          <img
            src={awardCesImg.src}
            alt="CES 2024 Best of Show award"
            style={{ width: "100px", height: "auto" }}
          />
          <AwardAweIcon style={{ width: "100px", height: "auto" }} />
          <img
            src={awardTimeImg.src}
            alt="TIME Best Invention of 2023 award"
            style={{ width: "100px", height: "90px", objectFit: "contain" }}
          />
          <AwardFcIcon style={{ width: "100px", height: "auto" }} />
        </div>
      </figure>

      <h2>From desktop to Spacetop</h2>

      <p>
        Translating the traditional desktop user interface to a 3D environment
        provided many challenges, both in design and implementation. My work
        involved prototyping novel spatial interactions, defining and developing
        frameworks to manage UI in 3D space, creating special shader effects and
        more.
      </p>

      {/* <figure className="grid-full">
        <TilePrototype />
        <figcaption>
          Interactive prototype: drag and resize tiles with snapping
        </figcaption>
      </figure> */}

      <h2>The Canvas</h2>
      <p>
        <img
          src={cursorMoveImg.src}
          alt="The cursor moving around on the canvas"
          style={{
            maxHeight: "200px",
            float: "inline-end",
            margin: "0 1rem",
            borderRadius: "var(--rounding-small)"
          }}
        />
        The canvas is a huge virtual &quot;screen&quot; that curves around the
        user. Instead of being limited by the edges of a physical screen, the
        virtual canvas can expand to fit many windows. To allow the users to
        understand the 3D shape and position of the canvas surface, we used a
        gentle grid of dots that is revealed around the cursor and content.
      </p>
      <p>
        The canvas itself can be panned and manipulated using touchpad gestures
        or keyboard shortcuts.
      </p>
      <figure className="grid-wide">
        <Image
          src={navImg}
          alt="The canvas itself can be panned and zoomed by the user"
          style={{ maxHeight: "500px" }}
        />
      </figure>

      <h2>UI Spaces</h2>

      <p>
        Spacetop allows UI to live in a new dimention - this opens up a lot of
        creative opportunities but comes with a unique set of challanges. UIs
        can obscure important content, overlap or intersect in ways that are
        simply not possible on a 2D screen.
      </p>

      <p>
        As part of my work on UI architecture in, I wanted to find a solution
        for this that would be intuitive, easy to use and reason about, an give
        the user the best experience
      </p>

      <p>
        To solve this, I came up with a concept of <strong>UI Spaces</strong> -
        coordinate systems that surround the user, each one with a set of
        behaviours, animations and limitations.
      </p>

      <p>
        For spacetop, I proposed a heirarchy of spaces nested within each other,
        where spaces closer to the user indicate urgency or importance:
      </p>

      <ul>
        <li> World Space</li>
        <li>Work Space</li>
        <li>Canvas Space</li>
        <li>User Space / Modal Space </li>
        <li>Head Space</li>
      </ul>

      <p>
        This structure gave Spacetop UI a predictable structure and allowed
        designers and developers to think where each UI belongs according to its
        use and context.
      </p>

      <p>
        In some cases, the limited field of view still required some creative
        solutions - such a the compass component that guides your attention when
        it is needed somewhere you can&apos;t see.
      </p>
      <figure>
        <Image
          src={compassImg}
          alt="The compass points the user to a window outside the field of view"
          style={{ maxHeight: "450px", maxWidth: "1000px" }}
        />
        <figcaption>
          The compass points to a window outside the field of view
        </figcaption>
      </figure>

      <h2>Materials & Rendering</h2>
      <p>
        Rendering spatial interfaces opens up interesting possibilities and
        effects. Subtle highlights can react to the movement of the head to give
        the illusion of depth. Soft shadows can indicate distance between
        objects.
      </p>
      <figure>
        <Image
          src={bevelImg}
          alt="A special shader that created a 3D illusion"
          style={{ maxHeight: "450px", maxWidth: "1000px" }}
        />
      </figure>
      <p>
        To remain performant, all UI rendering is based on quads, however in the
        fragment shader we can create special effects. In XR we know the
        position of the head. Using Parallax mapping and normal mapping a 3D
        illusion can be achieved.
      </p>

      <p>
        <ButtonLink
          href="https://www.sightful.com/"
          target="_blank"
          variant="opaque"
          rel="noreferrer"
        >
          Visit the official Spacetop site <span className="arrow">↗</span>
        </ButtonLink>
      </p>
    </>
  );
}
