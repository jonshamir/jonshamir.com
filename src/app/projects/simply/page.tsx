"use client";

import Image from "next/image";

import { ButtonLink } from "../../../components/Button";

export default function Page() {
  return (
    <>
      <h1>Simply Piano XR</h1>
      <p className="description">Piano learning app for Android XR</p>
      <p>
        I partnered with Simply to bring the popular piano learning app to
        Android XR. The project included both design and implementation on the
        newly released Android XR operating system from Google.
      </p>

      <figure className="grid-wide">
        <Image
          src="/projects/simply/hero.png"
          alt="Illustration of Simply Piano XR"
          style={{ maxHeight: "450px" }}
          width={4096}
          height={2304}
        />
        <figcaption>
          Simply Piano lets you see virtual indications on top of the real piano
        </figcaption>
      </figure>

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
    </>
  );
}
