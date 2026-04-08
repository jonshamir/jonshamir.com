"use client";

import Image from "next/image";

import { ButtonLink } from "../../../components/Button";
import { Outlink } from "../../../components/Outlink";
import heroImg from "./hero.jpg";
import notesImg from "./notes.png";

export default function Page() {
  return (
    <>
      <h1>Simply Piano XR</h1>
      <p className="description">Piano learning app for Android XR</p>
      <p>
        I partnered with Simply to bring the popular piano learning app to
        Android XR. The project included both design and implementation on the
        newly released{" "}
        <Outlink href="https://www.android.com/xr/">Android XR</Outlink>{" "}
        operating system from Google.
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
        I partnered with Simply to bring the popular piano learning app to
        Android XR. The project included both design and implementation on the
        newly released{" "}
        <Outlink href="https://www.android.com/xr/">Android XR</Outlink>{" "}
        operating system from Google.
      </p>

      <p>Learn more about the project here:</p>
      <p>
        <ButtonLink
          href="https://www.hellosimply.com/android-xr"
          target="_blank"
          variant="opaque"
          rel="noreferrer"
        >
          Simply Piano XR <span className="arrow">↗</span>
        </ButtonLink>
      </p>
      <h2>Note Rendering</h2>
      <p>
        In order to render musical notation that is crisp and clear from any
        andgle and distamce, I used signed distance fields that appear sharp and
        atialiased at any distance
      </p>
      <figure>
        <Image
          src={notesImg}
          alt="Note rendering"
          style={{
            filter: "invert(var(--dark-mode))"
        }}/>
        <figcaption>
          Musical notation is rendered using SDFs for optimal readability in XR
        </figcaption>
      </figure>
      <p>
        Virtual Keyboard For moments away from a real piano, the app includes a
        fully interactive virtual keyboard. Building a keyboard that feels
        responsive and spatially grounded — not floating in an uncanny void —
        required close attention to placement, scale, and interaction feedback.
      </p>
      <p>We took advantage of the spatial format to add spatial UI effects.</p>
    </>
  );
}
