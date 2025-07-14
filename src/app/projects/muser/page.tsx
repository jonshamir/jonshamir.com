"use client";

import { Outlink } from "../../../components/Outlink";

export default function Page() {
  return (
    <>
      <h1>Muser</h1>
      <p className="description">Smart music visualizer</p>
      <p>
        <a
          href="https://jonshamir.github.io/muser/"
          target="_blank"
          className="button"
          rel="noreferrer"
        >
          Visit Project <span className="arrow">↗</span>
        </a>
      </p>
      <p>
        Muser is an experiment in using machine learning to enhance music
        visualization. The idea originated while writing a seminar paper on the
        history of music visualization. I researched, designed and built the
        project as part of my studies.
      </p>
      <figure className="full-bleed">
        <video
          src="/projects/muser/demo.mp4"
          style={{ maxHeight: "300px", height: "auto", maxWidth: "1000px" }}
          playsInline
          autoPlay
          muted
          loop
        />
      </figure>
      <p>
        A pre-trained neural network called{" "}
        <Outlink href="https://github.com/jordipons/musicnn">musicnn</Outlink>{" "}
        predicts the musical genre for each second of a song. The predictions
        are then used to generate a color scheme. The final visualization color
        palette is based on the 5 most-fitting genres.
      </p>
      <p>
        We can use this to visualize how the style of a song changes over time:
        <span className="muserTimeline" />
        <span>
          <strong>Love the Way You Lie</strong> / Eminem feat. Rihanna
        </span>
      </p>
      <p>
        For example, we can see that this classic song by Eminem and Rihanna
        starts with an acoustic intro (bluish) then alternates between rap (red)
        and pop (yellow) segments.
      </p>
      <p>For more information visit the project website</p>
      <figure>
        <img
          src="/projects/muser/kandinsky.jpg"
          alt="Circles in a Circle by Wassily Kandinsky, 1923"
        />
        <figcaption>Circles in a Circle by Wassily Kandinsky, 1923</figcaption>
      </figure>
      <p>
        kandinsky Circles in a Circle by Wassily Kandinsky, 1923 Colors for each
        genre were chosen according to the{" "}
        <Outlink href="https://musicmap.info/">Musicmap</Outlink> project so
        that music genres which are stylistically closer will get similar
        colors.
      </p>
      <p>
        Muser is inspired by Wassily Kandinsky (1866-1944). Generally credited
        as the pioneer of abstract art, his work is well-known for its musical
        influences. Kandinsky associated specific tones and instruments to
        shapes and colors, thus “visualizing” a musical composition.
      </p>
    </>
  );
}
