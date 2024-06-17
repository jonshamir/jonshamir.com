import styles from "./MainLogo.module.scss";

export function MainLogo({ isHidden }: { isHidden?: boolean }) {
  return (
    <div className={styles.container + " " + styles.visible}>
      <div className={!isHidden && styles.rotate}>
        <div className={styles.logo}>
          <div className={styles.top}>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
          </div>
          <div className={styles.bottom}>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
          </div>
          <div className={styles.middle}>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
          </div>
          <div className={styles.side}>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
            <div className={styles.face}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
