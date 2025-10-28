import styles from "./ColorModeCover.module.css";

export function ColorModeCover() {
  const count = 7;
  return (
    <div className={`full-bleed ${styles.ColorModeCover}`}>
      <div className={styles.MoonContainer}>
        {Array.from({ length: count }).map((_, index) => (
          <Moon key={index} amount={(index + 1) / count} />
        ))}
      </div>
      <div className={styles.MoonContainer} style={{ transform: "scaleX(-1)" }}>
        {Array.from({ length: count }).map((_, index) => (
          <Moon key={index} amount={(index + 1) / count} />
        ))}
      </div>
    </div>
  );
}

function Moon({ amount }: { amount: number }) {
  const fill = amount < 0.5 ? "#555" : "white";
  const translateX = amount < 0.5 ? "0.1px" : "-0.1px";
  return (
    <svg width="128" height="128" viewBox="0 0 24 24">
      <path
        className={styles.LeftSide}
        d="M 12 5 A 7 7 0 0 1 12 19"
        fill="white"
      />
      <path
        className={styles.RightSide}
        d="M 12 5 A 7 7 0 0 1 12 19"
        fill={fill}
        style={{
          transform: `translateX(${translateX}) rotateY(${180 - amount * 180}deg)`
        }}
      />
    </svg>
  );
}
