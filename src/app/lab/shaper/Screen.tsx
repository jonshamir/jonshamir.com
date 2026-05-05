import styles from "./page.module.css";

export function Screen({ children }: { children: React.ReactNode }) {
  return <div className={styles.container}>{children}</div>;
}
