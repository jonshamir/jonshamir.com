import { ButtonLink } from "../components/Button";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>404</h1>
      <p className={styles.message}>This page could not be found.</p>
      <ButtonLink round variant="primary" href="/">
        Back to home
      </ButtonLink>
    </div>
  );
}
