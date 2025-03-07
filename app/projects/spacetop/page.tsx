"use client";

import { Outlink } from "../../../components/Outlink";

export default function Page() {
  return (
    <>
      <h1>Spacetop</h1>
      <span className="description">Augmented reality desktop OS</span>
      <p>
        <a
          href="https://prepbook.app"
          target="_blank"
          className="button"
          rel="noreferrer"
        >
          Visit Project <span className="arrow">↗</span>
        </a>
      </p>
      <p>
        Muser is an experiment to see how machine learning technology can be
        used to enhance music visualization. The idea originated while writing a
        seminar paper on the history of music visualization. I researched,
        designed and implemented the project from start to finish.
      </p>
      <p>
        A pre-trained neural network called{" "}
        <Outlink href="https://github.com/jordipons/musicnn">musicnn</Outlink>{" "}
        predicts the musical genre for each second of a song. The predictions
        are then used to generate a color scheme. The final visualization color
        palette is based on the 5 most-fitting genres.
      </p>
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
