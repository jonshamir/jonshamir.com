"use client";

import Image from "next/image";

import iconImg from "./icon.png";
import screenshotImg from "./screenshot.png";
import WeatherIcons from "./weather.svg";

export default function Page() {
  return (
    <>
      <p>
        <br />
        <br />
      </p>
      <Image
        src={iconImg}
        alt="Widgets Bar icon"
        style={{ width: "100px", height: "auto" }}
      />
      <h1>Widgets Bar</h1>
      <p className="description">Extension toolbar for Apple Safari</p>

      <p>
        Widgets Bar was a browser extension for{" "}
        <a href="https://www.apple.com/safari/">Apple Safari</a>. It provided a
        toolbar with small informative widgets to the top of the browser window.
        At it&apos;s peak, Widgets Bar was installed by thousand of users and
        featured by apple in the official <em>Safari Extension Gallery</em>.
      </p>
      <figure className="grid-wide">
        <Image
          src={screenshotImg}
          alt="Screenshot of Widgets Bar"
          style={{ height: "auto" }}
        />
        <figcaption>
          Screenshot of Widgets Bar running on Apple Safari 8
        </figcaption>
      </figure>
      <p>
        The widgets included weather, clocks, an RSS feed, and calendar. The
        look and feel of the extension was designed to fit in with the native
        MacOS design. A set of weather icons was created for the project to work
        in small sizes and on lower resolution displays which were common at the
        time.
      </p>
      <figure style={{ padding: "3em" }}>
        <WeatherIcons className="themed-svg" />
      </figure>
    </>
  );
}
