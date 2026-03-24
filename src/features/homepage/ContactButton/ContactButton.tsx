"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button, ButtonLink } from "../../../components/Button";
import styles from "./ContactButton.module.css";

const EASE_OUT_EXPO: [number, number, number, number] = [0.19, 1, 0.22, 1];

export function ContactButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isExpanded = isHovered || isOpen;

  // Close on outside tap
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isOpen]);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.contactButtonWrapper}${isOpen ? ` ${styles.expanded}` : ""}`}
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
      <ButtonLink
        round
        variant="primary"
        className={styles.copyAddressButton}
        href="mailto:hi@jonshamir.com"
        onClick={(e: React.MouseEvent) => {
          const canHover = window.matchMedia("(hover: hover)").matches;
          if (!isOpen && !canHover) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <span className={styles.textContainer}>
          <span className={styles.contactText}>
            Contact <span className="arrow">↗</span>
          </span>
          <span className={styles.copyAddressText}>hi@jonshamir.com</span>
        </span>
      </ButtonLink>
      <motion.div
        className={styles.emailMeButton}
        animate={{ x: isExpanded ? "9.8em" : "0%" }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: EASE_OUT_EXPO
        }}
      >
        <Button
          round
          variant="primary"
          onClick={() => {
            void navigator.clipboard.writeText("hi@jonshamir.com");
          }}
        >
          <span className={styles.contactButtonText}>Copy</span>
        </Button>
      </motion.div>
    </div>
  );
}
