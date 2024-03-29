import React from "react";
import ProjectPage from "./ProjectPage";

import Button from "../components/Button/Button";
import Image from "../components/Image/Image";

const ProjectMuser = (props) => {
  return (
    <ProjectPage>
      <Image
        ratio="2"
        src="assets/projects/muser/screenshot.png"
        alt="Muser Screenshot"
        className="Screenshot"
        style={{ backgroundColor: "#455d63" }}
      />
      <div className="section">
        <a
          href="https://jonshamir.github.io/muser"
          target="_blank"
          rel="noreferrer"
        >
          <Button>
            <span>Launch Project →</span>
          </Button>
        </a>
        <h1>Muser</h1>
        <p className="subtitle">Smart music visualizer</p>
        <p>
          Muser is an experiment to see how machine learning technology can be
          used to enhance music visualization. The idea originated while writing
          a seminar paper on the history of music visualization. I researched,
          designed and implemented the project from start to finish.
        </p>
        <p>
          A pre-trained neural network called{" "}
          <a
            href="https://github.com/jordipons/musicnn"
            target="_blank"
            rel="noreferrer"
          >
            musicnn
          </a>{" "}
          predicts the musical genre for each second of a song. The predictions
          are then used to generate a color scheme. The final visualization
          color palette is based on the 5 most-fitting genres.
        </p>
        <p>
          We can use this to visualize how the style of a song changes over
          time:
        </p>
        <p>
          <span className="muserTimeline" />
          <strong>Love the Way You Lie</strong> / Eminem feat. Rihanna
        </p>
        <p>
          For example, we can see that this classic song by Eminem and Rihanna
          starts with an acoustic intro (bluish) then alternates between rap
          (red) and pop (yellow) segments.
        </p>
        <p>For more information visit the project website!</p>
        <br />
        <figure>
          <Image src="assets/projects/muser/kandinsky.jpg" alt="kandinsky" />
          <span className="Caption">
            <span>Circles in a Circle </span>by Wassily Kandinsky, 1923
          </span>
        </figure>

        <p>
          Colors for each genre were chosen according to the{" "}
          <a href="https://musicmap.info/" target="_blank" rel="noreferrer">
            Musicmap
          </a>{" "}
          project so that music genres which are stylistically closer will get
          similar colors.
        </p>
        <p>
          Muser is inspired by Wassily Kandinsky (1866-1944). Generally credited
          as the pioneer of abstract art, his work is well-known for its musical
          influences. Kandinsky associated specific tones and instruments to
          shapes and colors, thus “visualizing” a musical composition.
        </p>
        <br />
        <h2>Tools Used</h2>
        <ul className="List">
          <li>JavaScript (React.js)</li>
          <li>WebGL (THREE.js + GLSL)</li>
          <li>Python</li>
        </ul>
      </div>
      <img
        src="assets/projects/muser/circles.png"
        alt=""
        className="muserCircles"
      />
    </ProjectPage>
  );
};

export default ProjectMuser;
