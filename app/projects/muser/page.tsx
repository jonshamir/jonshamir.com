"use client";

export default function Page() {
  return (
    <>
      <img src="/projects/muser/hero.png" alt="" className="hero" />
      <h1>Muser</h1>
      <span className="description">Smart music visualizer</span>
      <p>
        Muser is an experiment to see how machine learning technology can be
        used to enhance music visualization. The idea originated while writing a
        seminar paper on the history of music visualization. I researched,
        designed and implemented the project from start to finish.
      </p>
      <p>
        A pre-trained neural network called
        [musicnn](https://github.com/jordipons/musicnn) predicts the musical
        genre for each second of a song. The predictions are then used to
        generate a color scheme. The final visualization color palette is based
        on the 5 most-fitting genres.
      </p>
      <p>
        We can use this to visualize how the style of a song changes over time:
      </p>
      <span className="muserTimeline" />
      <strong>Love the Way You Lie</strong> / Eminem feat. Rihanna
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
        genre were chosen according to the [Musicmap](https://musicmap.info/)
        project so that music genres which are stylistically closer will get
        similar colors.
      </p>
      <p>
        Muser is inspired by Wassily Kandinsky (1866-1944). Generally credited
        as the pioneer of abstract art, his work is well-known for its musical
        influences. Kandinsky associated specific tones and instruments to
        shapes and colors, thus “visualizing” a musical composition.
      </p>
      <h2> Tools Used</h2>
      <ul>
        <li>JavaScript (interface)</li>
        <li>Python (data proccessing)</li>
      </ul>
    </>
  );
}