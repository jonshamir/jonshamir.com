"use client";

import Image from "next/image";

import coverImg from "./cover.jpg";

export default function Page() {
  return (
    <>
      <h1>Falcon Self-Serve Exam</h1>
      <p className="description">
        Patient-operated eye exam for a near-eye device
      </p>
      <p>
        Hooke&apos;s Falcon fits a full eye exam into one portable device. Hooke
        brought me in as a UX expert to remove the last requirement: the
        optometrist. The work covered hardware UX, a prototype, 3D animation and
        implementation.
      </p>

      <figure className="grid-wide">
        <Image
          src={coverImg}
          alt="A red dragonfly flying over a pond with water lilies"
        />
      </figure>

      <h2>The challenge</h2>
      <ul>
        <li>No one in the room to guide the patient</li>
        <li>One small display holds both the UI and the test stimulus</li>
        <li>The patient can&apos;t see their surroundings or their hands</li>
        <li>
          The existing screens had stimuli and buttons, but no instructions
        </li>
      </ul>

      <h2>Finding the right input</h2>
      <ul>
        <li>Compared buttons, joystick, dial and voice</li>
        <li>
          Built an Arduino rig with 3D-printed knobs and let people try it
        </li>
        <li>Chose a dial for its size, weight, click and feel</li>
      </ul>

      <h2>Designing in the dark</h2>
      <ul>
        <li>A pure black background makes the screen feel larger</li>
        <li>
          On-screen text is itself a vision stimulus, on optics sharper than the
          eye
        </li>
      </ul>

      <h2>A guided exam</h2>
      <ul>
        <li>
          Exam logic and state machine defined with Hooke&apos;s optometrist
        </li>
        <li>One question and a few answers per step</li>
        <li>Wrote the script and produced AI narration</li>
        <li>
          Sound, motion and transitions show what&apos;s happening and what
          comes next
        </li>
        <li>Snellen first, moving to Landolt C</li>
      </ul>

      <h2>The dragonfly</h2>
      <ul>
        <li>
          Replaced an old fish animation that looked bad and had several issues
        </li>
        <li>
          A dragonfly&apos;s natural flight matches the required trajectory
        </li>
        <li>Red, to blend with the device&apos;s red test LED</li>
        <li>
          Built in Blender, with distance set by age and timing synced to the
          measurements
        </li>
      </ul>

      <h2>From prototype to product</h2>
      <ul>
        <li>High-fidelity prototype in React</li>
        <li>Ported to Python and running on the device</li>
        <li>Data-driven exam flow</li>
      </ul>

      <h2>Status</h2>
      <p>Unreleased, with voice input as a possible next step.</p>
    </>
  );
}
