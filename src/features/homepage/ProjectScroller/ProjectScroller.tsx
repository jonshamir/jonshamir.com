"use client";

import { SideScroller } from "../../../components/SideScroller/SideScroller";
import styles from "./ProjectScroller.module.css";

export function ProjectScroller() {
  return (
    <SideScroller>
      <div className={styles.item}>
        <img src="/projects/spacetop/hero.png" alt="Spacetop" />
      </div>
      <div className={styles.item}>
        <img src="/projects/muser/hero.png" alt="Muser" />
      </div>
      <div className={styles.item}>
        <img src="/projects/widgets/screenshot.png" alt="Widgets Bar" />
      </div>
      <div className={styles.item}>
        <img src="/projects/leaf-map/hero.png" alt="Leaf Map" />
      </div>
    </SideScroller>
  );
}
