"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { Button, ButtonLink } from "../../../components/Button";
import styles from "./ContactButton.module.css";

const EASE_OUT_EXPO: [number, number, number, number] = [0.19, 1, 0.22, 1];

export function ContactButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isExpanded = isHovered || isOpen;

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

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
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
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
        className={styles.emailMeButton}
        href="mailto:hi@jonshamir.com"
        onClick={(e: React.MouseEvent) => {
          const canHover = window.matchMedia("(hover: hover)").matches;
          if (!isOpen && !canHover) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <span className={`${styles.slideContainer} ${styles.textContainer}`}>
          <span className={styles.slideTop}>
            Contact <span className="arrow">↗</span>
          </span>
          <span className={`${styles.slideBottom} ${styles.copyAddressText}`}>
            hi@jonshamir.com
          </span>
        </span>
      </ButtonLink>
      <motion.div
        className={styles.copyAddressButton}
        animate={{ x: isExpanded ? "9.8em" : "0%" }}
        transition={{
          duration: 0.5,
          ease: EASE_OUT_EXPO
        }}
      >
        <Button
          round
          variant="primary"
          onClick={() => {
            void navigator.clipboard.writeText("hi@jonshamir.com");
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
            setIsCopied(true);
            copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 1500);
          }}
        >
          <span className={styles.contactButtonText}>
            <span
              className={`${styles.slideContainer} ${styles.iconContainer}${isCopied ? ` ${styles.slid}` : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="currentColor"
                className={styles.slideTop}
              >
                <path d="M288-240v-624h528v624H288Zm72-72h384v-480H360v480ZM144-96v-624h72v552h456v72H144Zm216-216v-480 480Z" />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="currentColor"
                className={styles.slideBottom}
              >
                <path d="M389-267 195-460l51-52 143 143 325-324 51 51-376 375Z" />
              </svg>
            </span>
            Copy
          </span>
        </Button>
      </motion.div>
    </div>
  );
}
