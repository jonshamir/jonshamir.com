import styles from "./page.module.css";

export function Screen({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.container} ${className ?? ""}`}>{children}</div>
  );
}
