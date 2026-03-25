"use client";

import { SideScroller } from "../../../components/SideScroller/SideScroller";
import styles from "./ProjectScroller.module.css";

export function ProjectScroller() {
  return (
    <SideScroller>
      <div className={styles.item}>
        <img src="/projects/spacetop/hero.png" alt="Project 1" />
      </div>
      <div className={styles.item}>
        <h2>Slide 2</h2>
      </div>
      <div className={styles.item}>
        <h2>Slide 3</h2>
      </div>
      <div className={styles.item}>
        <h2>Slide 4</h2>
      </div>
    </SideScroller>
  );
}
