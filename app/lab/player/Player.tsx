"use client";

import { useEffect, useRef, useState } from "react";

import { MELODIES, SOUNDS } from "./utils";

interface Note {
  sound: string; // Note to play
  duration: number; // Duration in seconds
}

function parseMelody(melody: string): Note[] {
  const melodyArray = melody.split(/\s+/);
  return melodyArray.map((note) => {
    const split = note.split(":");
    return {
      sound: split[0],
      duration: parseFloat(split[1])
    };
  });
}

function wait(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export default function Player() {
  const soundRefs = useRef<Record<string, HTMLAudioElement>>({});
  const parsedMelodyRef = useRef<Note[]>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [melody, setMelody] = useState(MELODIES[0]);

  useEffect(() => {
    SOUNDS.forEach((sound) => {
      // Create a new Audio object for each file and store it in the refs
      soundRefs.current[sound] = new Audio(`/sound_bank/${sound}.wav`);
    });
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    setIsLoaded(false);
    void fetch(`/melodies/${melody}.txt`)
      .then((r) => r.text())
      .then((text) => {
        parsedMelodyRef.current = parseMelody(text);
        setIsLoaded(true);
      });
  }, [melody]);

  // Function to play the audio by file name
  const playMelody = async () => {
    const melody = parsedMelodyRef.current;
    if (melody && soundRefs.current) {
      let i = 0;
      while (i < melody.length) {
        void soundRefs.current[melody[i].sound].play();
        await wait(melody[i].duration);
        i++;
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem"
      }}
    >
      <select value={melody} onChange={(e) => setMelody(e.target.value)}>
        {MELODIES.map((melody) => (
          <option key={melody} value={melody}>
            {melody}
          </option>
        ))}
      </select>
      <button onClick={playMelody} disabled={!isLoaded}>
        {isLoaded ? "Play" : "Loading"}
      </button>
    </div>
  );
}
