"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useRef, useState } from "react";

import { Button, ButtonLink } from "../../../components/Button";
import styles from "./ContactButton.module.css";

const EASE_OUT_EXPO: [number, number, number, number] = [0.19, 1, 0.22, 1];

export function ContactButton() {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Force Safari to recalculate the SVG filter after animation ends
  const forceFilterRepaint = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.style.filter = "none";
    void el.offsetHeight;
    el.style.filter = "url(#meta)";
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={styles.contactButtonWrapper}
      style={{ filter: "url(#meta)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className={styles.hidden}>
        <defs>
          <filter id="meta">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -6"
              result="meta"
            />
            <feBlend in="SourceGraphic" in2="meta" />
          </filter>
        </defs>
      </svg>
      <Button
        round
        variant="primary"
        className={styles.copyAddressButton}
        onClick={() => {
          void navigator.clipboard.writeText("jon@studio-normal.com");
        }}
      >
        <span className={styles.textContainer}>
          <span className={styles.contactText}>
            Contact <span className="arrow">↗</span>
          </span>
          <span className={styles.copyAddressText}>hi@jonshamir.com</span>
        </span>
      </Button>
      <motion.div
        className={styles.emailMeButton}
        animate={{ x: isHovered ? "255%" : "0%" }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: EASE_OUT_EXPO
        }}
        onAnimationComplete={forceFilterRepaint}
      >
        <ButtonLink round variant="primary" href="mailto:jon@studio-normal.com">
          <span className={styles.contactButtonText}>Copy</span>
        </ButtonLink>
      </motion.div>
    </div>
  );
}
