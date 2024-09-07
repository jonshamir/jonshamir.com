"use client";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Slider from "react-slick";

import Earth from "../../lab/earth/Canvas";

export default function Page() {
  return (
    <>
      <h1>Unity CG</h1>
      <span className="description">Teaching Computer Graphics in Unity</span>

      <figure>
        <figcaption>
          <Earth />
          <span>
            A projection-mapping earth shader taught as part of the course
          </span>
        </figcaption>
      </figure>
      <p>
        In 2019 I was given the opportunity to rebuild the practical side of the
        Computer Graphics Course at the Hebrew University from the ground up.
        The goal was to teach Computer Graphics in a more engaging way, using
        the real-time interactivity of the Unity game engine.
      </p>
      <p>
        Due to the emerging COVID-19 pandemic, the class had to be taught
        remotely. In an attempt to improve the learning experience for the
        students, I created 12 lectures with over 500 slides including custom
        illustrations & animations that visualize different concepts.
      </p>

      <figure>
        <Slider Infinite={true} speed={250} autoplay autoplaySpeed={5000}>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i}>
              <img
                src={`/projects/unity-cg/slide${i + 1}.png`}
                alt={`Unity CG Slide ${i + 1}`}
                style={{ width: "100%" }}
              />
            </div>
          ))}
        </Slider>
        <figcaption>Some of the slides I created for the course</figcaption>
      </figure>
      <p>
        I also created 5 coding exercises involving subjects such as Subdivision
        Surfaces, Ray-Tracing, Shading, Texturing and more. I taught the
        students remotely and graded their assignments.
      </p>
      <h2>Tools Used</h2>
      <ul>
        <li>Unity3D + C#</li>
        <li>HLSL (shaders)</li>
        <li>Adobe CC</li>
        <li>Google Slides</li>
      </ul>
    </>
  );
}
