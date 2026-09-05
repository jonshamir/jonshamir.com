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

const STAGGER = 0.07;

// Owns the hover state so pointing at a list item re-renders this section
// rather than the whole page. The wrapper is a subgrid so the figure and list
// keep the page grid's named lines while sharing a row to overlap.
export function SpacesSection() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", {
    initializeWithValue: false
  });
  const [active, setActive] = useState<SpaceId | null>(null);

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
        >
          <SpacesCanvas hoveredSpace={active} play={playing} />
        </figure>
      )}
      <ul
        className={clsx(
          styles.spaceList,
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
