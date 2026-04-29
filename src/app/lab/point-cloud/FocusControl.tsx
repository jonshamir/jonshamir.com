"use client";

import styles from "./FocusControl.module.css";

type Props = {
  focus: number;
  onFocusChange: (v: number) => void;
};

export function FocusControl({ focus, onFocusChange }: Props) {
  return (
    <div className={styles.FocusControl}>
      <span className={styles.label}>Focus</span>
      <input
        className={styles.slider}
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={focus}
        onChange={(e) => onFocusChange(Number(e.target.value))}
      />
      <span className={styles.value}>{focus.toFixed(2)}</span>
    </div>
  );
}
