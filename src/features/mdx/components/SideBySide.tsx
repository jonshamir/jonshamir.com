import type { ReactNode } from "react";

import styles from "./SideBySide.module.css";

interface SideBySideProps {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}

export function SideBySide({ left, right, className }: SideBySideProps) {
  return (
    <div className={`grid-wide ${styles.wrapper} ${className || ""}`.trim()}>
      <div className={`${styles.panel} ${styles.left}`}>{left}</div>
      <div className={`${styles.panel} ${styles.right}`}>{right}</div>
    </div>
  );
}
