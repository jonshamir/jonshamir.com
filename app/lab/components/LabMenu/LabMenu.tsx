import styles from "./LabMenu.module.css";

interface LabMenuProps {
  title: string;
  description: string;
}

export function LabMenu({ title, description }: LabMenuProps) {
  return (
    <div className={styles.LabMenu}>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}
