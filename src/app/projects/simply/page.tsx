"use client";

import Image from "next/image";

import { ButtonLink } from "../../../components/Button";
import { Outlink } from "../../../components/Outlink";
import heroImg from "./hero.jpg";
import notesImg from "./notes.png";
import virtualPianoVideo from "./virtual-piano.mp4";

export default function Page() {
  return (
    <>
      <h1>Simply Piano XR</h1>
      <p className="description">Spatial piano learning app for Android XR</p>
      <p>
        I partnered with Simply to bring their popular piano learning app to{" "}
        <Outlink href="https://www.android.com/xr/">Android XR</Outlink>. It
        shipped in January 2026 as one of the first third-party apps on the
        platform.
      </p>

      <figure className="grid-wide">
        <Image
          src={heroImg}
          alt="Illustration of Simply Piano XR"
          style={{ maxHeight: "450px" }}
        />
        <figcaption>
          Simply Piano lets you see virtual indications on top of the real piano
        </figcaption>
      </figure>

      <p>
        The project included both design and implementation. Working alongside
        Simply's AR team, I built the entire app from the ground up using Unity
        and the Android XR SDK. The audio engine, lesson content and course
        structure were ported from Simply's existing apps.
      </p>

      <p>
        The app is a unique use case for mixed reality technology, allowing
        users to learn how to play by seeing virtual indications and hints on
        top of a real piano.
      </p>

      <p>
        <ButtonLink
          href="https://www.hellosimply.com/android-xr"
          target="_blank"
          variant="opaque"
          rel="noreferrer"
        >
          Simply Piano XR <span className="arrow">↗</span>
        </ButtonLink>
        {" "}
        <ButtonLink
          href="https://play.google.com/store/apps/details?id=com.simply.piano"
          target="_blank"
          variant="opaque"
          rel="noreferrer"
        >
          Play Store <span className="arrow">↗</span>
        </ButtonLink>
      </p>

      <h2>Virtual Piano</h2>
      <p>
        The virtual piano feature allows learning even without a physical
        instrument. Using hand tracking information from the device, users can
        practice in any environment.
      </p>

      <p>
        Building a keyboard that feels responsive and grounded required close
        attention to the hand interactions - telling a press from a hover,
        assigning fingers to keys, filtering false positives, smoothing jitter
        and more.
      </p>

      <figure className="grid-wide">
        <video src={virtualPianoVideo} autoPlay muted loop playsInline />
      </figure>

      <h2>Note Rendering</h2>
      <p>
        At the heart of the app, musical notation has to stay legible whether
        it's an arm's length away or across the room. I implemented a custom{" "}
        <i>signed distance field</i> note renderer that draws crisp, antialiased
        notes at any distance.
      </p>
      <figure>
        <Image
          src={notesImg}
          alt="Note rendering"
          style={{
            filter: "invert(var(--dark-mode))"
          }}
        />
      </figure>

      <h2>Design</h2>
      <p>
        The goal was to make Simply's existing visual language feel native to
        Android XR rather than a flat app floating in space. I kept the brand's
        look but rebuilt the layouts around depth — layering panels, notation
        and the keyboard at different distances to create hierarchy and bring
        the interface to life.
      </p>

      <h2>Outcome</h2>
      <p>
        Simply Piano XR is free on Google Play for Galaxy XR. It was featured in
        Google's Project Aura showcase at I/O 2026 and will ship on XREAL's Aura
        glasses at their launch later this year, moving the same experience from
        a passthrough headset to optical see-through glasses.
      </p>
    </>
  );
}
