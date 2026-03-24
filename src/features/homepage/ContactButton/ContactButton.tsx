"use client";

import { Button, ButtonLink } from "../../../components/Button";
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
          <span className={styles.copyAddressText}>Copy address</span>
        </span>
      </Button>
      <ButtonLink
        round
        variant="primary"
        href="mailto:jon@studio-normal.com"
        className={styles.emailMeButton}
      >
        <span className={styles.contactButtonText}>Email Me</span>
      </ButtonLink>
    </div>
  );
}
