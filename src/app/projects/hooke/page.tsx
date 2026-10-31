"use client";

import Image from "next/image";

import arduinoImg from "./arduino.jpg";
import coverImg from "./cover.jpg";
import dragonflyVideo from "./dragonfly.mp4";
import flightPathImg from "./flight-path.jpg";
import heroImg from "./hooke-device.jpg";
import inputButtonsImg from "./input-buttons.jpg";
import inputDialImg from "./input-dial.jpg";
import inputJoystickImg from "./input-joystick.jpg";
import styles from "./page.module.css";
import slideImg from "./slide.png";

const inputOptions = [
  { label: "Button pad", img: inputButtonsImg },
  { label: "Joystick", img: inputJoystickImg },
  { label: "Dial", img: inputDialImg }
];

export default function Page() {
  return (
    <>
      <h1>Hooke</h1>
      <p className="description">Self-guided eye exam device</p>
      <p>
        Hooke&apos;s Falcon fits a complete eye exam into one portable device,
        with AR optics that replace the traditional 3–6 metre exam room.
      </p>
      <p>
        Hooke brought me in as a UX expert to design a self-serve version of the
        exam: one that patients can take on their own, guided by the device
        itself.
      </p>
      <p>
        Since the experience depends on everything the patient touches, sees and
        hears, the work spanned the physical input, the in-device interface, a
        stereoscopic 3D animation and the device software.
      </p>

      <figure className="grid-wide">
        <Image
          src={heroImg}
          alt="A wall-mounted Falcon device being presented to a customer in a shop"
        />
        <figcaption>The Falcon self-serve eye exam</figcaption>
      </figure>

      <h2>The challenge</h2>
      <p>
        In a traditional exam, an optometrist guides you through every step.
        Here, the patient is on their own, which means:
      </p>
      <ul>
        <li>
          <strong>No one to ask.</strong> Every instruction has to come from the
          device.
        </li>
        <li>
          <strong>A tiny screen.</strong> Falcon&apos;s small display has to fit
          both the interface and the test stimulus.
        </li>
        <li>
          <strong>Working blind.</strong> Patients can&apos;t see their
          surroundings or their own hands.
        </li>
      </ul>
      <p>
        Existing screens, built for an optometrist to drive, have no
        instructions at all.
      </p>
      <p>
        The goal: an exam patients can complete confidently on their own, clear
        at every step, clinically valid and engaging.
      </p>

      <h2>Finding the right input</h2>
      <p>
        Every step comes down to picking one option from a short list, so the
        question was which control makes that easiest without looking.
      </p>
      <p>
        I explored a button pad, a joystick, a dial and voice control. Buttons
        are hard to tell apart by touch, joysticks are less precise, and voice
        is awkward in noisy or public places.
      </p>
      <figure className="grid-wide">
        <div className={styles.inputs}>
          {inputOptions.map(({ label, img }) => (
            <div key={label}>
              <Image src={img} alt={label} />
              <span className="figcaption">{label}</span>
            </div>
          ))}
        </div>
      </figure>
      <p>
        I built an Arduino prototype with 3D-printed knobs and had people try
        the options.
      </p>
      <figure>
        <Image
          src={arduinoImg}
          alt="Arduino joystick shield with buttons, wired to a white 3D-printed dial"
        />
        <figcaption>The Arduino test rig and a 3D-printed knob</figcaption>
      </figure>
      <p>
        The dial won: like the iPod click wheel, it&apos;s one gesture and one
        click, easy to use by touch and good for numbers like age. The final
        dial was chosen for its size, weight, click and feel.
      </p>

      <h2>Designing in the dark</h2>
      <p>
        The exam takes place on pure black, and the interface runs right up to
        the edge of the screen. Inside the device, that black is
        indistinguishable from the darkness around it, so the darkness becomes
        the whitespace: no pixels are spent on margins, and the screen feels
        larger than it is.
      </p>
      <p>Instructions and options sit clearly apart from the test stimulus.</p>
      <p>
        During an eye exam, interface text can affect results. The size and
        placement had to keep instructions readable without affecting the
        measurement.
      </p>
      <figure>
        <div className={styles.screen}>
          <Image
            src={slideImg}
            alt="Exam screen asking “What is the smallest line you can read?” with three lines of numbers and A, B, C answer buttons"
          />
        </div>
        <figcaption>
          The UI fills the screen edge to edge, using the device&apos;s darkness
          as its margin. Hover to see where the screen ends.
        </figcaption>
      </figure>

      <h2>A guided exam</h2>
      <p>
        I designed the exam as a conversation: each step asks one clear question
        with a few answers to choose from.
      </p>
      <p>
        Hooke&apos;s optometrist defined the exam logic as a state machine, and
        I turned each state into a step the patient can follow alone.
      </p>
      <p>
        I wrote the script and produced AI narration. Sound cues, animations and
        transitions confirm each answer and show what comes next.
      </p>
      <p>
        I built the flow as a high-fidelity prototype so Hooke could try it end
        to end.
      </p>
      <h2>The dragonfly</h2>
      <p>
        During the objective measurement, patients focus on a stereoscopic 3D
        dragonfly I modelled and animated in Blender.
      </p>
      <p>
        Its hovering flight naturally matches the path the target needs to
        follow, and its red colour blends with the device&apos;s red test LED.
      </p>
      <figure className="grid-wide">
        <video
          src={dragonflyVideo}
          poster={coverImg.src}
          aria-label="A red dragonfly hovering over a pond with water lilies"
          playsInline
          autoPlay
          muted
          loop
        />
      </figure>
      <p>
        The animation had to be precise: its virtual distance drives the
        eye&apos;s vergence and depth of field, so age sets how close it flies,
        and its timing stays in sync with the automated measurements.
      </p>
      <figure>
        <Image
          src={flightPathImg}
          alt="Top-down Blender view of the pond, with the dragonfly's flight path drawn between the lily pads"
        />
      </figure>

      <h2>Outcome</h2>
      <p>
        Following the prototype, Hooke asked me to implement the flow and
        interface as well. I built it into Falcon&apos;s custom software, with a
        data-driven flow the team can change without touching code.
      </p>
      <p>The self-serve exam is still unreleased.</p>
    </>
  );
}
