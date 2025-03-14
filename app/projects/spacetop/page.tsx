"use client";

export default function Page() {
  return (
    <>
      <h1>Spacetop</h1>
      <span className="description">Augmented reality laptop OS</span>
      <p>
        <a
          href="https://www.sightful.com/"
          target="_blank"
          className="button"
          rel="noreferrer"
        >
          Official Spacetop site <span className="arrow">↗</span>
        </a>
      </p>
      <p>
        Spacetop is a spatial operating system, designed to work with a
        keyboard, mouse and augmented reality glasses as a display. Unlike other
        XR products, Spacetop has a minimal learning curve and is intuitive to
        first-time users because it builds upon traditional desktop interaction
        paradigms.
      </p>

      <figure className="full-bleed">
        <img
          src="/projects/spacetop/hero.png"
          alt="Illustration of Spacetop being used on an airplane"
          style={{ maxHeight: "450px", height: "auto", maxWidth: "1000px" }}
        />
        <figcaption>
          Spacetop is like a huge virtual screen that you can take anywhere
        </figcaption>
      </figure>

      <p>
        Translating the traditional desktop user interface to a 3D environment
        provided many challenges, both in design and implementation. My work
        involved prototyping novel spatial interactions, defining and developing
        frameworks to manage UI in 3D space, creating special shader effects and
        more.
      </p>
      <h2>The Canvas</h2>
      <p>
        <img
          src="/projects/spacetop/cursor-move.gif"
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
        virtual canvas can expand to fit the content. To allow the users to
        understand the 3D shape of the canvas surface without being
        claustrophobic, a dot grid is revealed only around the cursor and
        content.
      </p>
      <p>
        The canvas itself can be panned and manipulated using touchpad gestures
        or keyboard shortcuts.
      </p>
      <figure className="full-bleed">
        <img
          src="/projects/spacetop/nav.gif"
          alt="The canvas itself can be panned and zoomed by the user"
          style={{ maxHeight: "500px", height: "auto", maxWidth: "1000px" }}
        />
      </figure>

      <h2>Spaces</h2>
      <p>
        What does it mean for a dialog or pop-up to be in 3D space? How can we
        ensure the user understands what's going on without losing context or
        missing a notification? The system UI structure, its layers, their roles
        and mechanics: how dialogs work, where do notifications pop up, how is
        input focus communicated, etc.
      </p>
      <p>
        Created a framework for managing user interfaces in 3D, integrating data
        from various sensors into a performant and easy to use API. Worked
        closely with the algorithms team to incorporate computer vision models
        into the product.
      </p>
      <figure>
        <img
          src="/projects/spacetop/compass.gif"
          alt="The compass points the user to a window outside the field of view"
          style={{ maxHeight: "450px", height: "auto", maxWidth: "1000px" }}
        />
        <figcaption>
          The compass points the user to a window outside the field of view.
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
        <img
          src="/projects/spacetop/bevel.gif"
          alt="A special shader that created a 3D illusion"
          style={{ maxHeight: "450px", height: "auto", maxWidth: "1000px" }}
        />
      </figure>
      <p>
        To remain performant, all UI rendering is based on quads, however in the
        fragment shader we can create special effects. In XR we know the
        position of the head. Using Parallax mapping and normal mapping a 3D
        &quot;illusion&quot; can be achieved.
      </p>

      <figure>
        <img
          src="/projects/spacetop/widgets.gif"
          alt="Widgets demonstrate the use of materials and rendering techniques."
          style={{ maxHeight: "450px", height: "auto", maxWidth: "1000px" }}
        />
        <figcaption>
          Widgets demonstrate the use of materials and rendering techniques.
        </figcaption>
      </figure>
    </>
  );
}
