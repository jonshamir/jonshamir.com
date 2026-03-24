"use client";

import { ButtonLink } from "../../../components/Button";
import styles from "./ContactButton.module.css";

export function ContactButton() {
  return (
    <div
      className={styles.contactButtonWrapper}
      style={{ filter: "url(#meta)" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className={styles.hidden}>
        <defs>
          <filter id="meta">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -6"
              result="meta"
            />
            <feBlend in="SourceGraphic" in2="meta" />
          </filter>
        </defs>
      </svg>
      <ButtonLink
        round
        variant="primary"
        href="mailto:jon@studio-normal.com"
        className={styles.contactButton}
      >
        <span className={styles.contactButtonText}>Copy Address</span>
      </ButtonLink>
      <ButtonLink
        round
        variant="primary"
        href="mailto:jon@studio-normal.com"
        className={styles.contactButton}
      >
        <span className={styles.contactButtonText}>
          Email Me<span className="arrow">↗</span>
        </span>
      </ButtonLink>
    </div>
  );
}
