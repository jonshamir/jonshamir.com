"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMediaQuery } from "usehooks-ts";

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

const SpacesCanvas = dynamic(() => import("./SpacesCanvas"), { ssr: false });

export default function Page() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", {
    initializeWithValue: false
  });

  return (
    <>
      <h1>Spacetop</h1>
      <p className="description">Augmented reality laptop OS</p>
      <p>
        Spacetop is a spatial operating system, designed to work with a
        keyboard, mouse and augmented reality glasses instead of a physical
        display. Spacetop has a minimal learning curve and is intuitive to
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
        the XR community, earning <i>Best of Show at CES 2024</i>,{" "}
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
      <p>
        Translating the traditional desktop user interface to a 3D environment
        provided many challenges, both in design and implementation. My work
        involved prototyping novel spatial interactions, defining and developing
        frameworks to manage UI in 3D space, creating special shader effects and
        more.
      </p>
      <p>
        I spent five years at Sightful building Spacetop — first as a UX
        engineer, then as UI architect. The role spanned design and engineering:
        prototyping novel spatial interactions, building the app frameworks and
        internal libraries the team shipped on. I continue to work with the team
        as a consultant.
      </p>

      <h2>UI Spaces</h2>
      <p>
        Giving the desktop a third dimension opens up a lot of exciting
        opportunities, but also a class of problems that don't exist in 2D:
        panels can obscure content, overlap and intersect, causing legibility
        issues and user confusion.
      </p>
      <p>
        To deal with this, I came up with the concept of <i>UI Spaces</i>: a set
        of 3D surfaces upon which UI can be placed. Each space has a set of
        properties - distance from the user, curvature, and following behavior -
        that is designed to convey the importance of its content to the user.
      </p>
      <p>
        The spaces are nested, and the closer a space sits to the user, the more
        insistent it is allowed to be.
      </p>
      <p>
        For spacetop, I proposed a heirarchy of spaces nested within each other,
        where spaces closer to the user indicate urgency or importance:
      </p>
      <ul>
        <li>
          World Space - global coordinate system. Content placed here stays
          fixed relative to the real environment.
        </li>
        <li>
          Work Space - the user's "setup", anchored by the user (or by hardware
          tracking). It positions the Canvas and holds 3D objects and UI within
          comfortable reach, like the Home Bar
        </li>
        <li>
          Canvas Space - a curved surface at the optimal viewing distance (1.5–2
          m) where main content lives.
        </li>
        <li>
          User Space - follows the user's yaw with damping, stays parallel to
          the ground, and snaps to the Canvas. Home to the launcher, system
          dialogs and notifications: present and persistent, but not blocking
        </li>
        <li>
          Head Space - HUD, follows the user's head. Highly distracting by
          design, so reserved for small, non-interactive indicators
        </li>
      </ul>
      <figure className="grid-full" style={{ minHeight: "30rem" }}>
        {!reducedMotion && <SpacesCanvas />}
      </figure>
      <p>
        This gave Spacetop UI a predictable structure and allowed designers and
        developers to reason about the 3D space surrounding the user, placing
        interface components according to their importance and context.
      </p>
      <p>
        <br />
      </p>
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
        The Canvas is a huge virtual &quot;screen&quot; that curves around the
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

      <h2>Cross-platform design system</h2>

      <p>
        Spacetop's interface is a mix of native Unity UI and embedded web-based
        apps, and they needed to look and behave identically. I designed and
        built a design system that spans both:
      </p>
      <p>
        a shared token and spec layer defining color, type, spacing, and motion
        a React component library for the web-based apps an experimental
        React-to-Unity renderer, built on open-source work, that drives Unity UI
        from React components a custom CSS-compatible shader for Unity that
        renders the same rounded rects, borders, and shadows the web components
        use — later extracted as UIRect
      </p>
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
