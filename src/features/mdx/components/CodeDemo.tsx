import type { ReactNode } from "react";

import styles from "./CodeDemo.module.css";
import { SideBySide } from "./SideBySide";

interface CodeDemoProps {
  demo: ReactNode;
  children: ReactNode;
}

export function CodeDemo({ demo, children }: CodeDemoProps) {
  return (
    <SideBySide left={children} right={demo} className={styles.codeDemo} />
  );
}
