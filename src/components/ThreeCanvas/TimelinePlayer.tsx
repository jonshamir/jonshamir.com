"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "../../lib/hooks/usePrefersReducedMotion";

export interface TimelinePlayerHandle {
  progress: number; // 0-1 state snapshot, updated once per animated frame
  progressRef: RefObject<number>;
  playingRef: RefObject<boolean>;
  replay: () => void;
  scrubTo: (progress: number) => void; // pauses playback and jumps
  commitProgress: (progress: number) => void; // driver-internal
}

// Owns the playback timeline for a canvas animation. Lives outside the Canvas;
// pair with <TimelineDriver> inside it. Starts finished when the user prefers
// reduced motion, otherwise autoplays.
export function useTimelinePlayer(): TimelinePlayerHandle {
  const reducedMotion = usePrefersReducedMotion();
  const progressRef = useRef(reducedMotion ? 1 : 0);
  const playingRef = useRef(!reducedMotion);
  const [progress, setProgress] = useState(progressRef.current);

  const replay = useCallback(() => {
    progressRef.current = 0;
    playingRef.current = true;
  }, []);

  const scrubTo = useCallback((p: number) => {
    playingRef.current = false;
    progressRef.current = p;
    setProgress(p);
  }, []);

  return {
    progress,
    progressRef,
    playingRef,
    replay,
    scrubTo,
    commitProgress: setProgress
  };
}

// Advances the player's timeline. Must live inside the Canvas (useFrame).
// getDuration is read every frame, so live-tuned durations take effect
// immediately; keep it cheap.
export function TimelineDriver({
  player,
  getDuration
}: {
  player: TimelinePlayerHandle;
  getDuration: () => number;
}) {
  const { progressRef, playingRef, commitProgress } = player;
  const invalidate = useThree((state) => state.invalidate);

  // Kick the first frame under frameloop="demand".
  useEffect(() => {
    if (playingRef.current) invalidate();
  }, [playingRef, invalidate]);

  useFrame((_, delta) => {
    if (!playingRef.current) return;
    const step = Math.min(delta, 0.05) / getDuration();
    progressRef.current = Math.min(1, progressRef.current + step);
    commitProgress(progressRef.current);
    if (progressRef.current >= 1) {
      playingRef.current = false;
    } else {
      invalidate();
    }
  });

  return null;
}
