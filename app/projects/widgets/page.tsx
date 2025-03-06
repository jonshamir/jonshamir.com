"use client";

import WeatherIcons from "./weather.svg";

export default function Page() {
  return (
    <>
      <img
        src="/projects/widgets/icon.png"
        alt="Widgets Bar icon"
        style={{ width: "100px" }}
      />
      <h1>Widgets Bar</h1>
      <span className="description">Extension toolbar for Apple Safari</span>

      <p>
        Widgets Bar was a browser extension for{" "}
        <a href="https://www.apple.com/safari/">Apple Safari</a>. It provided a
        toolbar with small informative widgets to the top of the browser window.
        At it&apos;s peak, it had thousand of users and was featured by apple in
        the <em>Safari Extension Gallery</em>.
      </p>
      <figure className="full-bleed">
        <img
          src="/projects/widgets/screenshot.png"
          alt="Screenshot of Widgets Bar"
          style={{ maxWidth: "1000px" }}
        />
        <figcaption>Screenshot of Widgets Bar running on Safari 8</figcaption>
      </figure>
      <p>
        The widgets included weather, clocks, an RSS feed, and calendar. The
        look and feel of the extension was designed to fit in with the native
        MacOS design. A set of weather icons was created especially for the
        project to work in small sizes and on lower resolution displays.
      </p>
      <figure style={{ padding: "3em" }}>
        <WeatherIcons className="themed-svg" />
      </figure>
    </>
  );
}
