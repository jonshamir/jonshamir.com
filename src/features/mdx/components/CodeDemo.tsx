import type { ReactNode } from "react";

import styles from "./CodeDemo.module.css";

interface CodeDemoProps {
  demo: ReactNode;
  reverse?: boolean;
  children: ReactNode;
}

export function CodeDemo({ demo, reverse, children }: CodeDemoProps) {
  const className = reverse
    ? `${styles.wrapper} ${styles.reverse}`
    : styles.wrapper;

  return (
    <div className={className}>
      <div className={styles.code}>{children}</div>
      <div className={styles.demo}>{demo}</div>
    </div>
  );
}
