"use client";

import { ButtonLink } from "../../../components/Button";
import styles from "./ContactButton.module.css";

export function ContactButton() {
  return (
    <ButtonLink
      round
      variant="primary"
      href="mailto:jon@studio-normal.com"
      className={styles.contactButton}
    >
      Contact<span className="arrow">↗</span>
    </ButtonLink>
  );
}
