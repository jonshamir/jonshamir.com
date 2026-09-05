"use client";

import { clsx } from "clsx";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";

import { type SpaceId, SPACES } from "./spaces";
import styles from "./spaces.module.css";

const SpacesCanvas = dynamic(() => import("./SpacesCanvas"), { ssr: false });

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

  // Only this item may clear the slot, so a blur arriving after the pointer has
  // already moved on to the next item doesn't wipe out its highlight.
  const clear = (id: SpaceId) =>
    setActive((prev) => (prev === id ? null : prev));

  return (
    <div className={clsx(styles.spaces, !reducedMotion && styles.overlay)}>
      {/* Rendering the figure at all would reserve a 30rem hole. */}
      {!reducedMotion && (
        <figure className={styles.figure} style={{ minHeight: "30rem" }}>
          <SpacesCanvas hoveredSpace={active} />
        </figure>
      )}
      <ul className={styles.spaceList}>
        {SPACES.map(({ id, name }) => (
          // The item clears on leave, not the ul: the ul's marker gutter and
          // the margins between items are inside it but outside every li, so
          // resting there would otherwise leave an animation running.
          <li
            key={id}
            className={active === id ? styles.active : undefined}
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
