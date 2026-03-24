"use client";

import styles from "./StaggeredText.module.css";

interface StaggeredTextProps {
  text: string;
  baseDelay?: number;
  staggerDelay?: number;
}

export function StaggeredText({
  text,
  baseDelay = 0.35,
  staggerDelay = 0.02
}: StaggeredTextProps) {
  const words = text.split(" ");

  return (
    <>
      {words.map((word, i) => (
        <span key={i} className={styles.wordWrapper}>
          <span
            className={styles.word}
            style={{ animationDelay: `${baseDelay + i * staggerDelay}s` }}
          >
            {word}
          </span>
        </span>
      ))}
    </>
  );
}
