"use client";

import { clsx } from "clsx";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useIntersectionObserver, useMediaQuery } from "usehooks-ts";

import {
  INTRO_DELAY_MS,
  INTRO_DURATION_MS,
  type SpaceId,
  SPACES
} from "./spaces";
import styles from "./spaces.module.css";

const SpacesCanvas = dynamic(() => import("./SpacesCanvas"), { ssr: false });

// Seconds between consecutive names appearing.
const STAGGER = 0.07;

// Owns the hover state so pointing at a list item re-renders this section
// rather than the whole page. The wrapper is a subgrid spanning `full`, which
// keeps the page grid's tracks and named lines available to the figure and the
// list — they were direct children of `main.grid` before, and that is where
// their columns came from. Sharing a grid row is what lets the list sit over
// the canvas on wide screens; see spaces.module.css.
export function SpacesSection() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", {
    initializeWithValue: false
  });
  const [active, setActive] = useState<SpaceId | null>(null);

  // The intro is one timeline, owned here rather than inside the canvas
  // because both halves of it live in this component: the canvas fades in on
  // sight, the camera move starts a beat later, and the names appear once it
  // has finished. Timers rather than a callback from the canvas — they fire
  // even if WebGL never starts, so the list can't be stranded invisible.
  // Frozen once visible: `isIntersecting` latches, so the effect runs exactly
  // once and scrolling back out can't restart it.
  const { isIntersecting, ref } = useIntersectionObserver({
    rootMargin: "25% 0% 25% 0%",
    threshold: 0,
    freezeOnceVisible: true
  });
  const [playing, setPlaying] = useState(false);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!isIntersecting) return;
    const orbit = setTimeout(() => setPlaying(true), INTRO_DELAY_MS);
    const names = setTimeout(
      () => setRevealed(true),
      INTRO_DELAY_MS + INTRO_DURATION_MS
    );
    return () => {
      clearTimeout(orbit);
      clearTimeout(names);
    };
  }, [isIntersecting]);

  // Only this item may clear the slot, so a blur arriving after the pointer has
  // already moved on to the next item doesn't wipe out its highlight.
  const clear = (id: SpaceId) =>
    setActive((prev) => (prev === id ? null : prev));

  return (
    <div
      ref={ref}
      className={clsx(styles.spaces, !reducedMotion && styles.overlay)}
    >
      {/* Rendering the figure at all would reserve a 30rem hole. */}
      {!reducedMotion && (
        <figure
          className={clsx(
            styles.figure,
            styles.canvasFade,
            isIntersecting && styles.visible
          )}
          style={{ minHeight: "30rem" }}
        >
          <SpacesCanvas hoveredSpace={active} play={playing} />
        </figure>
      )}
      <ul
        className={clsx(
          styles.spaceList,
          // Held back only when there is an intro to wait for.
          !reducedMotion && (revealed ? styles.revealed : styles.pending)
        )}
      >
        {SPACES.map(({ id, name }, i) => (
          // The item clears on leave, not the ul: the ul's marker gutter and
          // the margins between items are inside it but outside every li, so
          // resting there would otherwise leave an animation running.
          <li
            key={id}
            className={active === id ? styles.active : undefined}
            style={{ animationDelay: `${i * STAGGER}s` }}
            // These items have no activation — focus alone is what drives the
            // scene, and it's the only way to reach the animation without a
            // pointer. That is exactly what the rule guards against, and five
            // extra tab stops is the accepted cost of keyboard parity.
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            onPointerEnter={() => setActive(id)}
            onPointerLeave={() => clear(id)}
            onFocus={() => setActive(id)}
            onBlur={() => clear(id)}
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
